import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, MapPin, CreditCard, DollarSign, QrCode, CheckCircle2, ChevronRight, Clock, RefreshCw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEV_WHATSAPP_NUMBER = '5541998990192';

const ORIGIN_LAT = -25.4932516;
const ORIGIN_LNG = -49.3100917;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

const DELIVERY_TIMES = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
const TAKEOUT_TIMES = ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00'];

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotalMin, cartTotalMax } = useStore();
  const { isAuthenticated, adminConfig } = useAuth();
  
  const now = adminConfig?.simulatedTime || new Date();
  const isSunday = now.getDay() === 0 || adminConfig?.ignoreDeliveryRule;

  // Step in Drawer: 'CART' | 'CHECKOUT' | 'SUCCESS'
  const [step, setStep] = useState<'CART' | 'CHECKOUT' | 'SUCCESS'>('CART');

  // Checkout Form States
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'TAKEOUT'>('TAKEOUT');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [cep, setCep] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const handleCepChange = async (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);
    
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setCep(formatted);

    const numericCep = raw;
    if (numericCep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${numericCep}`);
        const data = await response.json();
        
        if (data.street) setStreet(data.street);
        if (data.neighborhood) setNeighborhood(data.neighborhood);

        let destLng = 0;
        let destLat = 0;
        let foundCoordinates = false;

        // Try getting exact coordinates from Nominatim (more accurate than BrasilAPI)
        if (data.street && data.city) {
          try {
            const nomUrl = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(data.street)}&city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&country=Brazil&format=json`;
            const nomRes = await fetch(nomUrl, { headers: { 'Accept-Language': 'pt-BR' } });
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
              destLat = parseFloat(nomData[0].lat);
              destLng = parseFloat(nomData[0].lon);
              foundCoordinates = true;
            }
          } catch (e) {
            console.warn('Nominatim error', e);
          }
        }

        // Fallback to BrasilAPI coordinates
        if (!foundCoordinates && data && data.location && data.location.coordinates) {
          destLng = parseFloat(data.location.coordinates.longitude);
          destLat = parseFloat(data.location.coordinates.latitude);
          foundCoordinates = true;
        }

        if (foundCoordinates && !isNaN(destLat) && !isNaN(destLng)) {
            let dist = getDistanceFromLatLonInKm(ORIGIN_LAT, ORIGIN_LNG, destLat, destLng);
            
            // Tentar obter a distância real de condução via OSRM
            try {
              const osrmResponse = await fetch(`https://router.project-osrm.org/route/v1/driving/${ORIGIN_LNG},${ORIGIN_LAT};${destLng},${destLat}?overview=false`);
              const osrmData = await osrmResponse.json();
              if (osrmData.code === 'Ok' && osrmData.routes && osrmData.routes.length > 0) {
                // distance is returned in meters
                dist = osrmData.routes[0].distance / 1000;
              }
            } catch (err) {
              console.warn("Falha ao obter distância OSRM, usando linha reta.", err);
            }

            setDeliveryDistance(dist);
            
            let calcFee = 5.50;
            if (dist > 2.0) {
              const extraKm = Math.ceil(dist - 2.0);
              calcFee += extraKm * 2.00;
            }
            if (calcFee >= 7.50) {
              calcFee -= 2.00;
            }
            setDeliveryFee(calcFee);
          } else {
            setDeliveryFee(8.00); 
            setDeliveryDistance(null);
          }
      } catch (e) {
        console.error("Erro ao buscar CEP", e);
        setDeliveryFee(8.00);
      } finally {
        setIsFetchingCep(false);
      }
    } else {
      setDeliveryFee(0);
      setDeliveryDistance(null);
    }
  };
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'CASH'>('PIX');
  const [changeFor, setChangeFor] = useState('');
  
  // Partial Payment States
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [paymentMethod1, setPaymentMethod1] = useState<'PIX' | 'CARD' | 'CASH'>('PIX');
  const [paymentMethod2, setPaymentMethod2] = useState<'PIX' | 'CARD' | 'CASH'>('CASH');
  const [partialAmount1, setPartialAmount1] = useState('');
  const [changeFor1, setChangeFor1] = useState('');
  const [changeFor2, setChangeFor2] = useState('');

  const formatCurrencyInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (!raw) return '';
    const num = parseInt(raw, 10);
    return (num / 100).toFixed(2).replace('.', ',');
  };

  const changeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paymentMethod === 'CASH' && changeInputRef.current) {
      changeInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      changeInputRef.current.focus();
    }
  }, [paymentMethod]);

  const isTimeInPast = (timeStr: string) => {
    if (isAuthenticated) return false;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    return timeDate < now;
  };

  const handlePhoneChange = (val: string) => {
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    
    let formatted = v;
    if (v.length >= 3 && v.length <= 6) {
      formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length >= 7 && v.length <= 10) {
      formatted = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    } else if (v.length === 11) {
      formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    }
    setCustomerPhone(formatted);
  };

  // Store last generated WhatsApp URL for easy re-sending
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string>('');
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  if (!isOpen) return null;

  const currentDeliveryFee = deliveryType === 'DELIVERY' ? deliveryFee : 0;
  const finalMinTotal = cartTotalMin + currentDeliveryFee;
  const finalMaxTotal = cartTotalMax + currentDeliveryFee;
  const hasRange = cartTotalMin !== cartTotalMax;

  // Complete reset of checkout form & cart steps
  const resetFormAndCart = () => {
    setStep('CART');
    setCustomerName('');
    setCustomerPhone('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setComplement('');
    setCep('');
    setDeliveryDistance(null);
    setDeliveryFee(0);
    setPreferredTime('');
    setPaymentMethod('PIX');
    setChangeFor('');
    setIsPartialPayment(false);
    setPaymentMethod1('PIX');
    setPaymentMethod2('CASH');
    setPartialAmount1('');
    setChangeFor1('');
    setChangeFor2('');
    setLastWhatsAppUrl('');
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || (deliveryType === 'DELIVERY' && (!street || !number))) {
      setValidationModal({
        isOpen: true,
        title: '⚠️ DADOS INCOMPLETOS',
        message: 'Por favor, preencha todos os campos obrigatórios do formulário.'
      });
      return;
    }

    if (deliveryType === 'TAKEOUT' && !preferredTime) {
      setValidationModal({
        isOpen: true,
        title: '⚠️ HORÁRIO DE RETIRADA',
        message: 'Por favor, selecione um Horário Previsto para Retirada no balcão antes de enviar o pedido.'
      });
      return;
    }

    if (isPartialPayment) {
      const num1 = parseFloat(partialAmount1.replace(',', '.'));
      if (isNaN(num1) || num1 < 10) {
        setValidationModal({
          isOpen: true,
          title: '⚠️ VALOR INVÁLIDO',
          message: 'O valor da primeira forma de pagamento deve ser de no mínimo R$ 10,00.'
        });
        return;
      }
      if (num1 >= finalMaxTotal) {
        setValidationModal({
          isOpen: true,
          title: '⚠️ VALOR INVÁLIDO',
          message: 'O valor da primeira forma de pagamento é maior ou igual ao total. Por favor, use apenas uma forma de pagamento.'
        });
        return;
      }
    }

    // Build Formatted WhatsApp Message
    let text = ``;
    
    if (deliveryType === 'DELIVERY') {
      if (deliveryFee > 25) {
        text += `⚠️ *ATENÇÃO: TAXA ESPECIAL DE ENTREGA*\n`;
      }
      if (deliveryDistance && deliveryDistance > 15) {
        text += `⚠️ *ATENÇÃO: LONGA DISTÂNCIA (${deliveryDistance.toFixed(1)} km)*\n`;
      }
    }

    text += `*Novo Pedido - Assados Vaguinho*\n\n`;
    text += `*Cliente:* ${customerName}\n`;
    text += `*Telefone:* ${customerPhone}\n`;
    text += `*Tipo:* ${deliveryType === 'DELIVERY' ? 'Delivery' : 'Retirada no Balcão'}\n`;

    if (deliveryType === 'DELIVERY') {
      text += `*Endereço:* ${street}, Nº ${number}\n`;
      text += `*Bairro:* ${neighborhood}\n`;
      if (cep) text += `*CEP:* ${cep}\n`;
      if (complement) text += `*Complemento:* ${complement}\n`;
      if (preferredTime) text += `*Horário Preferencial de Entrega:* ${preferredTime}\n`;
    } else {
      if (preferredTime) text += `*Horário Previsto para Retirada:* ${preferredTime}\n`;
    }

    text += `\n*--- ITENS DO PEDIDO ---*\n`;
    cart.forEach((item, idx) => {
      text += `\n*${idx + 1}. ${item.product.name}* (x${item.quantity})\n`;
      if (item.selectedOptionLabel) {
        text += `   Opção: ${item.selectedOptionLabel}\n`;
      }

      if (item.notes) {
        text += `   Obs: ${item.notes}\n`;
      }
      
      const minItem = item.minUnitPrice || item.finalUnitPrice;
      const maxItem = item.maxUnitPrice || item.finalUnitPrice;
      if (minItem !== maxItem) {
        text += `   Valor Estimado: R$ ${(minItem * item.quantity).toFixed(2)} ~ R$ ${(maxItem * item.quantity).toFixed(2)}\n`;
      } else {
        text += `   Valor: R$ ${(item.finalUnitPrice * item.quantity).toFixed(2)}\n`;
      }
    });

    text += `\n*--- PAGAMENTO & VALORES ---*\n`;
    if (hasRange) {
      text += `Subtotal Estimado: R$ ${cartTotalMin.toFixed(2)}\n`;
      text += `Taxa de Entrega: R$ ${currentDeliveryFee.toFixed(2)}\n`;
      text += `*TOTAL ESTIMADO:* R$ ${finalMinTotal.toFixed(2)} ~ R$ ${finalMaxTotal.toFixed(2)} (Sujeito à variação de peso das fatias/peças)\n`;
    } else {
      text += `Subtotal: R$ ${cartTotalMin.toFixed(2)}\n`;
      text += `Taxa de Entrega: R$ ${currentDeliveryFee.toFixed(2)}\n`;
      text += `*TOTAL FINAL: R$ ${finalMinTotal.toFixed(2)}*\n`;
    }
    const paymentSuffix = deliveryType === 'DELIVERY' ? 'na Entrega' : 'na Retirada';
    if (isPartialPayment) {
      const num1 = parseFloat(partialAmount1.replace(',', '.'));
      const num2 = finalMaxTotal - num1;
      
      const p1Label = paymentMethod1 === 'PIX' ? 'PIX' : paymentMethod1 === 'CARD' ? 'Cartão' : `Dinheiro (Troco para R$ ${changeFor1 || 'Não informado'})`;
      const p2Label = paymentMethod2 === 'PIX' ? 'PIX' : paymentMethod2 === 'CARD' ? 'Cartão' : `Dinheiro (Troco para R$ ${changeFor2 || 'Não informado'})`;
      
      text += `*Formas de Pagamento (${paymentSuffix}):*\n`;
      text += `1) R$ ${num1.toFixed(2).replace('.', ',')} no ${p1Label}\n`;
      text += `2) R$ ${num2.toFixed(2).replace('.', ',')} no ${p2Label}\n`;
    } else {
      text += `*Forma de Pagamento:* ${paymentMethod === 'PIX' ? 'PIX' : paymentMethod === 'CARD' ? `Cartão ${paymentSuffix}` : `Dinheiro ${paymentSuffix} (Troco para R$ ${changeFor || 'Não informado'})`}\n`;
    }

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${DEV_WHATSAPP_NUMBER}?text=${encodedText}`;

    setLastWhatsAppUrl(whatsappUrl);
    window.open(whatsappUrl, '_blank');
    setStep('SUCCESS');
    // clearCart() removido para permitir "Voltar e Modificar Pedido"
  };

  const handleReopenWhatsApp = () => {
    if (lastWhatsAppUrl) {
      window.open(lastWhatsAppUrl, '_blank');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#121214] border-l border-[#27272a] h-full flex flex-col shadow-2xl text-white relative"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-[#ea580c]" size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider italic">
                    {step === 'CART' ? 'Seu Carrinho' : step === 'CHECKOUT' ? 'Dados para Entrega' : 'Pedido Confirmado'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#27272a] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {cart.length === 0 && step !== 'SUCCESS' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-[#18181b] border border-[#27272a] rounded-full flex items-center justify-center text-gray-500">
                      <ShoppingBag size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Carrinho Vazio</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Adicione delícias do cardápio para finalizar seu pedido!
                      </p>
                    </div>
                  </div>
                ) : step === 'CART' ? (
                  /* --- STEP 1: CART LIST --- */
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const minI = item.minUnitPrice || item.finalUnitPrice;
                      const maxI = item.maxUnitPrice || item.finalUnitPrice;
                      const itemHasRange = minI !== maxI;

                      return (
                        <div
                          key={item.cartItemId}
                          className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 space-y-2 relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                              {item.selectedOptionLabel && (
                                <p className="text-xs text-[#ea580c] font-bold">
                                  Opção: {item.selectedOptionLabel}
                                </p>
                              )}

                              {item.notes && (
                                <p className="text-[11px] text-amber-400 italic">
                                  Obs: "{item.notes}"
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-gray-500 hover:text-red-400 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#27272a]/60">
                            <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="w-6 h-6 rounded bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-mono font-bold px-2">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="w-6 h-6 rounded bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <span className="font-mono font-bold text-xs sm:text-sm text-white">
                              {itemHasRange ? (
                                `R$ ${(minI * item.quantity).toFixed(2).replace('.', ',')} ~ R$ ${(maxI * item.quantity).toFixed(2).replace('.', ',')}`
                              ) : (
                                `R$ ${(item.finalUnitPrice * item.quantity).toFixed(2).replace('.', ',')}`
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : step === 'CHECKOUT' ? (
                  /* --- STEP 2: CHECKOUT FORM --- */
                  <form id="checkout-form" onSubmit={handleSendWhatsAppOrder} className="space-y-4 text-xs">
                    {/* Delivery Type */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isSunday && !adminConfig?.ignoreDeliveryRule) {
                            setValidationModal({
                              isOpen: true,
                              title: 'ENTREGA INDISPONÍVEL',
                              message: 'O serviço de entrega (Delivery) está disponível apenas aos Domingos. Nos demais dias, trabalhamos apenas com retirada no balcão.'
                            });
                            setDeliveryType('TAKEOUT');
                            return;
                          }
                          setDeliveryType('DELIVERY');
                          setPreferredTime('');
                        }}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                          deliveryType === 'DELIVERY'
                            ? 'border-[#ea580c] bg-[#ea580c]/10 text-white'
                            : 'border-[#27272a] bg-[#18181b] text-gray-400'
                        }`}
                      >
                        <MapPin size={16} /> Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryType('TAKEOUT');
                          setPreferredTime('');
                        }}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                          deliveryType === 'TAKEOUT'
                            ? 'border-[#ea580c] bg-[#ea580c]/10 text-white'
                            : 'border-[#27272a] bg-[#18181b] text-gray-400'
                        }`}
                      >
                        <ShoppingBag size={16} /> Retirada no Balcão
                      </button>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-2 bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Seus Dados</h4>
                      <div>
                        <label className="block text-gray-400 mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: Enzo Grasciano"
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Telefone (WhatsApp) *</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="(41) 99999-9999"
                          maxLength={15}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                        />
                      </div>
                    </div>

                    {/* Address Info (if Delivery) */}
                    {deliveryType === 'DELIVERY' && (
                      <div className="space-y-2 bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                        <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Endereço de Entrega</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-gray-400 mb-1">Rua / Avenida *</label>
                            <input
                              type="text"
                              required
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              placeholder="Ex: Rua XV de Novembro"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Número *</label>
                            <input
                              type="text"
                              required
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              placeholder="123"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-400 mb-1">CEP *</label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={cep}
                                onChange={(e) => handleCepChange(e.target.value)}
                                placeholder="80000-000"
                                maxLength={9}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                              />
                              {isFetchingCep && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="text-[10px] text-[#ea580c] hover:underline mt-1 block">Não sei meu CEP</a>
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Bairro *</label>
                            <input
                              type="text"
                              required
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                              placeholder="Ex: Novo Mundo"
                              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-1">Complemento / Ponto de Referência</label>
                          <input
                            type="text"
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                            placeholder="Apt 42, Bloco B"
                            className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                          />
                        </div>
                      </div>
                    )}

                    {/* PREFERRED TIME SELECTOR */}
                    <div className="space-y-2 bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Clock size={14} className="text-[#ea580c]" />
                        {deliveryType === 'DELIVERY'
                          ? 'Horário Preferencial de Entrega (Opcional)'
                          : 'Horário Previsto para Retirada *'}
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 pt-1">
                        {(deliveryType === 'DELIVERY' ? DELIVERY_TIMES : TAKEOUT_TIMES).map(time => {
                          const disabled = isTimeInPast(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={disabled}
                              onClick={() => setPreferredTime(preferredTime === time ? '' : time)}
                              className={`p-2 rounded-lg border text-center font-mono font-bold text-xs transition-all ${
                                disabled
                                  ? 'border-[#27272a] bg-[#121214] text-gray-600 cursor-not-allowed opacity-50'
                                  : preferredTime === time
                                    ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_12px_rgba(234,88,12,0.2)]'
                                    : 'border-[#27272a] bg-[#09090b] text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-2 bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Forma de Pagamento</h4>
                      
                      {!isPartialPayment ? (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'PIX', label: 'Pix', icon: QrCode },
                              { id: 'CARD', label: 'Cartão', icon: CreditCard },
                              { id: 'CASH', label: 'Dinheiro', icon: DollarSign }
                            ].map(pm => {
                              const Icon = pm.icon;
                              return (
                                <button
                                  key={pm.id}
                                  type="button"
                                  onClick={() => setPaymentMethod(pm.id as any)}
                                  className={`p-2.5 rounded-lg border font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                                    paymentMethod === pm.id
                                      ? 'border-[#ea580c] bg-[#ea580c]/10 text-white'
                                      : 'border-[#27272a] bg-[#09090b] text-gray-400'
                                  }`}
                                >
                                  <Icon size={16} />
                                  <span>{pm.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {paymentMethod === 'CASH' && (
                            <div className="pt-2">
                              <label className="block text-gray-400 mb-1">Precisa de troco para quanto?</label>
                              <input
                                ref={changeInputRef}
                                type="text"
                                value={changeFor}
                                onChange={(e) => setChangeFor(e.target.value)}
                                placeholder="Ex: Troco para R$ 100,00"
                                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#ea580c]"
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setIsPartialPayment(true)}
                            className="w-full mt-2 bg-transparent text-gray-500 hover:text-white py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors border border-gray-800 hover:border-gray-600"
                          >
                            Mais de uma forma de pagamento...
                          </button>
                        </>
                      ) : (
                        <div className="space-y-4">
                          {/* Payment Form 1 */}
                          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
                            <h5 className="font-bold text-[#ea580c] text-xs mb-2">Primeira Forma (Mín. R$ 10)</h5>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              {[
                                { id: 'PIX', label: 'Pix', icon: QrCode },
                                { id: 'CARD', label: 'Cartão', icon: CreditCard },
                                { id: 'CASH', label: 'Dinheiro', icon: DollarSign }
                              ].map(pm => {
                                const Icon = pm.icon;
                                return (
                                  <button
                                    key={pm.id}
                                    type="button"
                                    onClick={() => setPaymentMethod1(pm.id as any)}
                                    className={`p-2 rounded border font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                                      paymentMethod1 === pm.id
                                        ? 'border-[#ea580c] bg-[#ea580c]/10 text-white'
                                        : 'border-[#27272a] bg-[#121214] text-gray-400'
                                    }`}
                                  >
                                    <Icon size={14} />
                                    <span className="text-[10px]">{pm.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mb-2">
                              <label className="block text-gray-400 mb-1 text-[10px]">Qual a quantia?</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={partialAmount1}
                                  onChange={(e) => setPartialAmount1(formatCurrencyInput(e.target.value))}
                                  placeholder="0,00"
                                  className="w-full bg-[#121214] border border-[#27272a] rounded p-2 pl-8 text-white focus:outline-none focus:border-[#ea580c]"
                                />
                              </div>
                            </div>
                            {paymentMethod1 === 'CASH' && (
                              <div>
                                <label className="block text-gray-400 mb-1 text-[10px]">Troco para quanto?</label>
                                <input
                                  type="text"
                                  value={changeFor1}
                                  onChange={(e) => setChangeFor1(e.target.value)}
                                  placeholder="Ex: R$ 50,00"
                                  className="w-full bg-[#121214] border border-[#27272a] rounded p-2 text-white focus:outline-none focus:border-[#ea580c]"
                                />
                              </div>
                            )}
                          </div>

                          {/* Payment Form 2 */}
                          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-bold text-[#ea580c] text-xs">Segunda Forma</h5>
                              <span className="text-gray-400 text-[10px]">Restante Automático</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {[
                                { id: 'PIX', label: 'Pix', icon: QrCode },
                                { id: 'CARD', label: 'Cartão', icon: CreditCard }
                              ].map(pm => {
                                const Icon = pm.icon;
                                return (
                                  <button
                                    key={pm.id}
                                    type="button"
                                    onClick={() => setPaymentMethod2(pm.id as any)}
                                    className={`p-2 rounded border font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                                      paymentMethod2 === pm.id
                                        ? 'border-[#ea580c] bg-[#ea580c]/10 text-white'
                                        : 'border-[#27272a] bg-[#121214] text-gray-400'
                                    }`}
                                  >
                                    <Icon size={14} />
                                    <span className="text-[10px]">{pm.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {/* Restante Automático Visual */}
                            <div className="bg-[#18181b] border border-[#ea580c]/30 rounded p-2 text-center mt-2">
                              <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider">Restante a Pagar</span>
                              <span className="text-sm font-black text-[#ea580c]">
                                {(() => {
                                  const num1 = parseFloat(partialAmount1.replace(',', '.')) || 0;
                                  const restMin = Math.max(0, finalMinTotal - num1);
                                  const restMax = Math.max(0, finalMaxTotal - num1);
                                  if (hasRange && restMin !== restMax) {
                                    return `R$ ${restMin.toFixed(2).replace('.', ',')} ~ R$ ${restMax.toFixed(2).replace('.', ',')}`;
                                  }
                                  return `R$ ${restMax.toFixed(2).replace('.', ',')}`;
                                })()}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsPartialPayment(false)}
                            className="w-full mt-2 bg-transparent border border-gray-600 hover:bg-[#27272a] text-gray-400 hover:text-white py-2.5 rounded-lg font-bold text-xs transition-colors"
                          >
                            Apenas uma forma de pagamento
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                ) : (
                  /* --- STEP 3: SUCCESS WITH RE-SEND WHATSAPP OPTION --- */
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                    <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 text-green-400 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-wide">
                        Pedido Enviado com Sucesso!
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">
                        Seu pedido foi formatado e enviado para o WhatsApp (<span className="text-[#ea580c] font-mono font-bold">+55 41 99899-0192</span>).
                      </p>
                    </div>

                    {/* TWO ACTION BUTTONS: RE-SEND WHATSAPP OR START NEW ORDER */}
                    <div className="w-full space-y-2.5 pt-2">
                      {lastWhatsAppUrl && (
                        <button
                          onClick={handleReopenWhatsApp}
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(34,197,94,0.3)] transition-all"
                        >
                          <RefreshCw size={16} />
                          <span>Reenviar Pedido no WhatsApp</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setStep('CART');
                        }}
                        className="w-full bg-transparent border border-[#27272a] hover:bg-[#18181b] text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-all"
                      >
                        <ChevronRight size={14} className="rotate-180" />
                        <span>Voltar ao pedido / Modificar</span>
                      </button>

                      <button
                        onClick={() => {
                          resetFormAndCart();
                          clearCart();
                          onClose();
                        }}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3.5 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all"
                      >
                        Limpar e Iniciar Novo Pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {cart.length > 0 && step !== 'SUCCESS' && (
                <div className="p-4 sm:p-5 bg-[#18181b] border-t border-[#27272a] space-y-3 shrink-0">
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal:</span>
                      <span>
                        {hasRange
                          ? `R$ ${cartTotalMin.toFixed(2).replace('.', ',')} ~ R$ ${cartTotalMax.toFixed(2).replace('.', ',')}`
                          : `R$ ${cartTotalMin.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Taxa de Entrega:</span>
                      <span>R$ {currentDeliveryFee.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-[#27272a]">
                      <span>{hasRange ? 'Total Estimado:' : 'Total Final:'}</span>
                      <span className="text-[#ea580c]">
                        {hasRange
                          ? `R$ ${finalMinTotal.toFixed(2).replace('.', ',')} ~ R$ ${finalMaxTotal.toFixed(2).replace('.', ',')}`
                          : `R$ ${finalMinTotal.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                  </div>

                  {step === 'CART' ? (
                    <button
                      onClick={() => setStep('CHECKOUT')}
                      className="w-full bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(234,88,12,0.3)] transition-all"
                    >
                      <span>Avançar para Entrega</span>
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setStep('CART')}
                        className="bg-[#27272a] hover:bg-[#3f3f46] text-white py-3 rounded-xl font-bold text-xs"
                      >
                        Voltar
                      </button>
                      <button
                        form="checkout-form"
                        type="submit"
                        className="col-span-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(34,197,94,0.3)] transition-all"
                      >
                        <Send size={16} />
                        <span>Enviar no WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY VALIDATION MODAL */}
      <AnimatePresence>
        {validationModal.isOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#18181b] border border-amber-500/50 rounded-2xl p-6 space-y-4 shadow-2xl text-center text-white"
            >
              <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-wide text-amber-400 uppercase">
                  {validationModal.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {validationModal.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setValidationModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Entendi, vou ajustar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
