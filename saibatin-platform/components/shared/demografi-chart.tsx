'use client';

import { motion } from 'framer-motion';
import type { DemografiDataset } from '@/lib/demografi-data';

export function DemografiChart({ dataset }: { dataset: DemografiDataset }) {
  const max = Math.max(...dataset.items.map((i) => i.value));
  const total = dataset.items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8">
      <h2 className="text-lg font-semibold text-slate-900">{dataset.title}</h2>
      <p className="text-sm text-slate-500 mt-1 mb-6">{dataset.description}</p>

      <div className="space-y-4">
        {dataset.items.map((item, i) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">
                {item.value.toLocaleString('id-ID')} {dataset.unit}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-500">
        Total: <span className="font-semibold text-slate-900">{total.toLocaleString('id-ID')} {dataset.unit}</span>
      </div>
    </div>
  );
}
