import React, { useState, useEffect } from 'react';
import type { MenuItem, SellOption } from '../data';

import { X, Plus, Minus, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

import { getProductImage } from '../utils/images';

interface ProductCustomizerModalProps {
  product: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (configuredItem: {
    product: MenuItem;
    selectedOptionLabel?: string;
    notes: string;
    quantity: number;
    finalPrice: number;
    minPrice: number;
    maxPrice: number;
  }) => void;
}

const ProductCustomizerModalInner: React.FC<ProductCustomizerModalProps & { product: MenuItem }> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const imageUrl = getProductImage(product);
  const { adminConfig } = useAuth();
  const { storeStatus } = useStore();
  const isMarmita = product.isMarmita || product.id === 'fav3';
  const hasSellOptions = product.sellOptions && product.sellOptions.length > 0;

  // States
  const [selectedSellOption, setSelectedSellOption] = useState<SellOption | null>(
    hasSellOptions ? product.sellOptions![0] : null
  );

  // Marmita da Casa States
  const [marmitaSide, setMarmitaSide] = useState<'Arroz à Grega' | 'Risoto de Frango'>('Arroz à Grega');
  const [marmitaMeat, setMarmitaMeat] = useState<'1 Fatia de Costela' | '1 Coxa com Sobrecoxa'>('1 Fatia de Costela');

  // Kg Sub-section State
  const [selectedKgPreset, setSelectedKgPreset] = useState<number | 'OTHER'>(1.0);
  const [customKgValue, setCustomKgValue] = useState<string>('300');
  const [customKgUnit, setCustomKgUnit] = useState<'g' | 'kg'>('g');

  // Slices Sub-section State
  const [selectedSlicePreset, setSelectedSlicePreset] = useState<number | 'OTHER'>(2);
  const [customSliceValue, setCustomSliceValue] = useState<string>('5');


  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Overlay Alert Modal States
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'MIN_WEIGHT' | 'MIN_PRICE' | 'HIGH_VALUE' | 'STORE_CLOSED';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'MIN_WEIGHT',
    title: '',
    message: ''
  });

  // Reset state on product open
  useEffect(() => {
    if (product) {
      const defaultOpt = product.sellOptions && product.sellOptions.length > 0 ? product.sellOptions[0] : null;
      setSelectedSellOption(defaultOpt);
      setMarmitaSide('Arroz à Grega');
      setMarmitaMeat('1 Fatia de Costela');
      setSelectedKgPreset(1.0);
      setCustomKgValue('300');
      setCustomKgUnit('g');
      setSelectedSlicePreset(2);
      setCustomSliceValue('5');

      setNotes('');
      setQuantity(1);
      setAlertModal({ isOpen: false, type: 'MIN_WEIGHT', title: '', message: '' });
    }
  }, [product]);



  // Format mode based on relational DB unit
  const isKgMode = selectedSellOption?.unitLabel?.toLowerCase() === 'kg';
  const isSliceMode = selectedSellOption?.unitLabel?.toLowerCase() === 'fatia';
  const isMeatCategory = product.category.includes('Carne');

  // Calculate Raw Weight in Kg
  let calculatedKg = 1.0;
  let rawKgInput = 1.0;
  if (isKgMode) {
    if (selectedKgPreset === 'OTHER') {
      const rawVal = parseFloat(customKgValue) || 0;
      rawKgInput = customKgUnit === 'g' ? rawVal / 1000 : rawVal;
      calculatedKg = rawKgInput;
    } else {
      calculatedKg = Number(selectedKgPreset);
      rawKgInput = calculatedKg;
    }
  }

  // Calculate Slices Count
  let calculatedSlices = 1;
  if (isSliceMode) {
    if (selectedSlicePreset === 'OTHER') {
      calculatedSlices = Math.max(1, parseInt(customSliceValue, 10) || 1);
    } else {
      calculatedSlices = Number(selectedSlicePreset);
    }
  }

  // Base Prices
  let minBasePrice = product.price;
  let maxBasePrice = product.price;

  if (isMarmita) {
    minBasePrice = 35.00;
    maxBasePrice = 35.00;
  } else if (isKgMode) {
    minBasePrice = calculatedKg * product.price;
    maxBasePrice = minBasePrice;
  } else if (isSliceMode) {
    // Slices range from ~250g to ~350g per slice
    minBasePrice = calculatedSlices * 0.250 * product.price;
    maxBasePrice = calculatedSlices * 0.350 * product.price;
  } else if (selectedSellOption) {
    minBasePrice = selectedSellOption.price;
    maxBasePrice = selectedSellOption.price;
  }

  const minUnitPrice = minBasePrice;
  const maxUnitPrice = maxBasePrice;
  const avgUnitPrice = (minUnitPrice + maxUnitPrice) / 2;

  const totalMin = minUnitPrice * quantity;
  const totalMax = maxUnitPrice * quantity;

  // Option Label
  let optionLabel = selectedSellOption ? selectedSellOption.label : undefined;
  if (isMarmita) {
    optionLabel = `${marmitaSide} + ${marmitaMeat}`;
  } else if (isKgMode) {
    optionLabel = `Por Quilo (${calculatedKg >= 1 ? calculatedKg.toFixed(1) + 'kg' : (calculatedKg * 1000).toFixed(0) + 'g'})`;
  } else if (isSliceMode) {
    optionLabel = `Por Fatia (${calculatedSlices} fatia${calculatedSlices > 1 ? 's' : ''})`;
  }

  // Handle Order Add with Overlay Popups validation
  const handleConfirmAttempt = (bypassHighValue = false) => {
    // 0. Store Closed Validation (Server-Side Truth)
    if (!storeStatus.isOpen && !adminConfig?.ignoreStoreStatus) {
      setAlertModal({
        isOpen: true,
        type: 'STORE_CLOSED',
        title: '⚠️ ESTABELECIMENTO FECHADO',
        message: storeStatus.statusText
      });
      return;
    }

    // 1. Meat Minimum Validation (250g = 0.250 kg)
    if (isKgMode && isMeatCategory && rawKgInput < 0.250) {
      setAlertModal({
        isOpen: true,
        type: 'MIN_WEIGHT',
        title: '⚠️ QUANTIDADE MÍNIMA NÃO ALCANÇADA',
        message: `O pedido mínimo para carnes a quilo é de 250g (0,250 kg). A quantidade atual de ${(rawKgInput * 1000).toFixed(0)}g está abaixo do limite mínimo.`
      });
      return;
    }

    // 2. Side Dishes Minimum Validation (R$ 10,00)
    if (isKgMode && !isMeatCategory && totalMin < 10.00) {
      setAlertModal({
        isOpen: true,
        type: 'MIN_PRICE',
        title: '⚠️ QUANTIDADE MÍNIMA NÃO ALCANÇADA',
        message: `O pedido mínimo para acompanhamentos a quilo é de R$ 10,00. O valor atual de R$ ${totalMin.toFixed(2).replace('.', ',')} está abaixo do mínimo.`
      });
      return;
    }

    // 3. High Value Confirmation (> R$ 1.000,00)
    if (totalMax >= 1000 && !bypassHighValue) {
      setAlertModal({
        isOpen: true,
        type: 'HIGH_VALUE',
        title: '⚠️ CONFIRMAÇÃO DE VALOR ALTO',
        message: `O valor deste item é R$ ${totalMax.toFixed(2).replace('.', ',')} (acima de R$ 1.000,00). Por favor, verifique se a quantidade em quilos ou gramas está correta.`
      });
      return;
    }

    onAddToCart({
      product,
      selectedOptionLabel: optionLabel,
      notes,
      quantity,
      finalPrice: avgUnitPrice,
      minPrice: minUnitPrice,
      maxPrice: maxUnitPrice
    });
    onClose();
  };

  const kgPresets = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5];
  const slicePresets = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      >
        {/* MAIN CUSTOMIZER MODAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#121214] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl my-8 text-white max-h-[90vh] flex flex-col"
        >
          {/* Header Bar */}
          {imageUrl ? (
            <div className="relative h-48 sm:h-56 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${imageUrl})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/50 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                  {product.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide">
                  {product.name}
                </h2>
              </div>
            </div>
          ) : (
            <div className="relative p-6 bg-gradient-to-r from-red-950/40 via-[#ea580c]/20 to-amber-950/40 border-b border-[#27272a] shrink-0 flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                  {product.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white">
                  {product.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all z-10"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Scrollable Content Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {product.description && (
              <p className="text-gray-300 text-sm leading-relaxed border-b border-[#27272a] pb-4">
                {product.description}
              </p>
            )}

            {/* MARMITA DA CASA EXCLUSIVE OPTIONS */}
            {isMarmita && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                    ESCOLHA O ACOMPANHAMENTO
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Arroz à Grega', label: 'Arroz à Grega' },
                      { id: 'Risoto de Frango', label: 'Risoto de Frango' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMarmitaSide(opt.id as any)}
                        className={`p-3.5 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all ${
                          marmitaSide === opt.id
                            ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                            : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#27272a] pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                    ESCOLHA A CARNE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: '1 Fatia de Costela', label: '1 Fatia de Costela' },
                      { id: '1 Coxa com Sobrecoxa', label: '1 Coxa com Sobrecoxa' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMarmitaMeat(opt.id as any)}
                        className={`p-3.5 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all ${
                          marmitaMeat === opt.id
                            ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                            : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT SELECTOR: COMO DESEJA PEDIR? (Pizza Style Clean Buttons) */}
            {hasSellOptions && !isMarmita && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  COMO DESEJA PEDIR?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.sellOptions!.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedSellOption(option)}
                      className={`p-3.5 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all ${
                        selectedSellOption?.id === option.id
                          ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                          : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC SUB-SECTION: POR QUILO (QUANTO DESEJA PEDIR?) */}
            {isKgMode && !isMarmita && (
              <div className="space-y-3 border-t border-[#27272a] pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  QUANTO DESEJA PEDIR?
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {kgPresets.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedKgPreset(val)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        selectedKgPreset === val
                          ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                          : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {val.toFixed(1).replace('.', ',')} kg
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedKgPreset('OTHER')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      selectedKgPreset === 'OTHER'
                        ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                        : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    Outra Qtd
                  </button>
                </div>

                {/* OTHER QUANTITY INPUT FIELD */}
                {selectedKgPreset === 'OTHER' && (
                  <div className="bg-[#18181b] border border-[#27272a] p-3.5 rounded-xl space-y-3 mt-3">
                    <label className="block text-xs font-bold text-gray-300">
                      Qual a quantidade desejada? ({isMeatCategory ? 'Mínimo: 250g' : 'Mínimo: R$ 10,00'})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={customKgValue}
                        onChange={(e) => setCustomKgValue(e.target.value)}
                        placeholder="Ex: 300"
                        className="flex-1 bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#ea580c]"
                      />
                      <div className="flex bg-[#09090b] border border-[#27272a] rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setCustomKgUnit('g')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            customKgUnit === 'g' ? 'bg-[#ea580c] text-white' : 'text-gray-400'
                          }`}
                        >
                          Gramas (g)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomKgUnit('kg')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            customKgUnit === 'kg' ? 'bg-[#ea580c] text-white' : 'text-gray-400'
                          }`}
                        >
                          Quilos (kg)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC SUB-SECTION: POR FATIA (QUANTAS FATIAS?) */}
            {isSliceMode && !isMarmita && (
              <div className="space-y-3 border-t border-[#27272a] pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  QUANTAS FATIAS?
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {slicePresets.map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSelectedSlicePreset(count)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        selectedSlicePreset === count
                          ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                          : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {count} Fatia{count > 1 ? 's' : ''}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedSlicePreset('OTHER')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      selectedSlicePreset === 'OTHER'
                        ? 'border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                        : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    Outra Qtd
                  </button>
                </div>

                {/* OTHER SLICE QUANTITY INPUT FIELD */}
                {selectedSlicePreset === 'OTHER' && (
                  <div className="bg-[#18181b] border border-[#27272a] p-3.5 rounded-xl space-y-2 mt-3">
                    <label className="block text-xs font-bold text-gray-300">
                      Digite o número de fatias desejado:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customSliceValue}
                      onChange={(e) => setCustomSliceValue(e.target.value)}
                      placeholder="Ex: 5"
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>
                )}
              </div>
            )}



            {/* NOTES */}
            <div className="border-t border-[#27272a] pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                OBSERVAÇÕES DO ITEM
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Tirar a cebola, ponto bem passado, etc."
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ea580c]"
              />
            </div>
          </div>

          {/* Footer Bar (Clean Fixed Price Range Display - imagem 2.jpeg fix) */}
          <div className="p-4 sm:p-6 bg-[#18181b] border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {(!isKgMode && !isSliceMode) && (
              <div className="flex items-center gap-3 bg-[#09090b] border border-[#27272a] rounded-xl p-1.5 w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="font-mono font-bold text-lg px-3 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 shadow-[0_0_10px_rgba(234,88,12,0.5)] text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleConfirmAttempt(false)}
              className="w-full sm:flex-1 bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white py-3 px-4 sm:px-5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-between shadow-[0_4px_20px_rgba(234,88,12,0.3)] transition-all gap-2"
            >
              <span className="shrink-0 font-bold">Adicionar ao Pedido</span>
              
              {/* Single Line Price Formatting with tilde ~ (R$64,95 ~ R$90,93) */}
              {isSliceMode ? (
                <span className="font-mono text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap">
                  R${totalMin.toFixed(2).replace('.', ',')} ~ R${totalMax.toFixed(2).replace('.', ',')}
                </span>
              ) : (
                <span className="font-mono text-sm sm:text-base font-bold shrink-0 whitespace-nowrap">
                  R${totalMin.toFixed(2).replace('.', ',')}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* OVERLAY ALERT MODAL (Modal Layer ON TOP of Modal z-[60]) */}
        <AnimatePresence>
          {alertModal.isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
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
                    {alertModal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {alertModal.message}
                  </p>
                </div>

                {alertModal.type === 'HIGH_VALUE' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                      className="bg-[#27272a] hover:bg-[#3f3f46] text-white py-3 rounded-xl font-bold text-xs uppercase"
                    >
                      Corrigir Qtd
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlertModal(prev => ({ ...prev, isOpen: false }));
                        handleConfirmAttempt(true); // Bypass high value check and add to cart
                      }}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg"
                    >
                      Confirmar Valor
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                    className="w-full bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
                  >
                    Entendi, vou ajustar
                  </button>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </>
  );
};

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = (props) => {
  return (
    <AnimatePresence>
      {props.isOpen && props.product && (
        <ProductCustomizerModalInner {...props} product={props.product} />
      )}
    </AnimatePresence>
  );
};
