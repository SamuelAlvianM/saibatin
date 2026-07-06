'use client';

// Bagan struktur organisasi. Diisolasi dari profile-tabs karena
// react-organizational-chart menyentuh `document` saat modul di-import,
// sehingga hanya boleh dimuat di client (dynamic import ssr:false).

import { Tree, TreeNode } from 'react-organizational-chart';
import { cn } from '@/lib/utils';

function OrgBox({ node, root = false }: { node: any; root?: boolean }) {
  const hasNama = node.nama && node.nama !== '-';
  return (
    <div
      className={cn(
        'rounded-xl border px-3.5 py-2.5 text-center w-[190px] shrink-0',
        root
          ? 'text-white border-transparent shadow-md shadow-primary/25'
          : 'bg-gradient-to-br from-primary/[0.09] to-primary/[0.03] border-primary/15 shadow-sm',
      )}
      style={root ? { background: 'linear-gradient(135deg, #2176bd, #1b4b72)' } : undefined}
    >
      <p className={cn('font-semibold text-xs leading-tight', root ? 'text-white' : 'text-slate-900')}>
        {node.jabatan}
      </p>
      {hasNama && (
        <p className={cn('text-[0.68rem] mt-0.5', root ? 'text-white/75' : 'text-slate-500')}>
          {node.nama}
        </p>
      )}
    </div>
  );
}

/** Node rekursif: satu jabatan + turunannya, dipetakan ke <TreeNode>. */
function OrgTreeNodes({ nodes, childrenOf }: { nodes: any[]; childrenOf: (j: string) => any[] }) {
  return (
    <>
      {nodes.map((n) => (
        <TreeNode key={n.jabatan} label={<div className="inline-flex"><OrgBox node={n} /></div>}>
          <OrgTreeNodes nodes={childrenOf(n.jabatan)} childrenOf={childrenOf} />
        </TreeNode>
      ))}
    </>
  );
}

export function StrukturChart({ data }: { data: { organisasi?: any[] } }) {
  const org: any[] = Array.isArray(data.organisasi) ? data.organisasi : [];
  const childrenOf = (jab: string) => org.filter((o) => (o.parent ?? '') === jab);
  // Root = jabatan tanpa atasan (atau atasannya tidak ada di daftar).
  const roots = org.filter((o) => !o.parent || !org.some((x) => x.jabatan === o.parent));

  if (org.length === 0) {
    return <p className="text-sm text-slate-400 py-10 text-center">Struktur organisasi belum diisi.</p>;
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-max flex flex-col items-center gap-8 px-4">
        {roots.map((root) => (
          <Tree
            key={root.jabatan}
            lineWidth="1px"
            lineColor="rgba(33,118,189,0.25)"
            lineBorderRadius="8px"
            label={<div className="inline-flex"><OrgBox node={root} root /></div>}
          >
            <OrgTreeNodes nodes={childrenOf(root.jabatan)} childrenOf={childrenOf} />
          </Tree>
        ))}
      </div>
    </div>
  );
}

export default StrukturChart;
