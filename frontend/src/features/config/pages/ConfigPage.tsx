import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  configService,
  CONFIG_TABS,
  PRESET_COLORS,
  type ConfigItem,
  type ConfigType,
} from '../services/config.service';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigType>('lead_category');
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConfigItem | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const tab = CONFIG_TABS.find((t) => t.id === activeTab)!;

  const load = (type: ConfigType) => {
    setLoading(true);
    setError('');
    configService
      .list(type)
      .then(setItems)
      .catch((e) => setError(e?.response?.data?.message ?? 'Could not load.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setModalOpen(true);
  };

  const openEdit = (item: ConfigItem) => {
    setEditing(item);
    setName(item.name);
    setColor(item.color ?? PRESET_COLORS[0]);
    setModalOpen(true);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await configService.update(editing.id, {
          name: trimmed,
          color: tab.hasColor ? color : undefined,
        });
      } else {
        await configService.create({
          type: activeTab,
          name: trimmed,
          color: tab.hasColor ? color : undefined,
        });
      }
      setModalOpen(false);
      load(activeTab);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ConfigItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await configService.remove(item.id);
      load(activeTab);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not delete.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink uppercase tracking-wide">
          Configuration
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-ink-border">
        {CONFIG_TABS.map((t) => {
          const on = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-[13.5px] font-medium rounded-t-md border-b-2 transition-colors ${
                on
                  ? 'bg-ink text-white border-ink'
                  : 'bg-transparent text-ink-muted border-transparent hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content card */}
      <div className="bg-white border border-ink-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">
            {tab.label.replace('Lead ', '')}
          </h2>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-ink text-white text-[13px] font-medium hover:bg-ink/90"
          >
            <Plus className="w-4 h-4" /> {tab.addLabel}
          </button>
        </div>

        {error && (
          <div className="px-5 py-3 text-[13px] text-danger bg-red-50 border-y border-red-100">
            {error}
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="border-y border-ink-border">
            <tr className="text-center text-[12px] uppercase tracking-wider font-semibold">
              <th className="px-5 py-3 text-emerald-700">{tab.label}</th>
              {tab.hasColor && (
                <th className="px-5 py-3 text-emerald-700 w-24">Color</th>
              )}
              <th className="px-5 py-3 text-emerald-700 w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={tab.hasColor ? 3 : 2}
                  className="px-5 py-8 text-center text-ink-muted"
                >
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={tab.hasColor ? 3 : 2}
                  className="px-5 py-8 text-center text-ink-muted"
                >
                  Nothing here yet. Click "{tab.addLabel}".
                </td>
              </tr>
            )}
            {!loading &&
              items.map((item) => (
                <tr key={item.id} className="border-t border-ink-border">
                  <td className="px-5 py-3 text-center text-ink">
                    {item.name}
                  </td>
                  {tab.hasColor && (
                    <td className="px-5 py-3 text-center">
                      <span
                        className="inline-block w-5 h-5 rounded-full border border-ink-border"
                        style={{ backgroundColor: item.color ?? '#e5e7eb' }}
                      />
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-ink-muted hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="text-ink-muted hover:text-danger"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-[420px] w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-ink">
                {editing ? `Edit ${tab.label}` : tab.addLabel}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-ink-muted hover:bg-ink-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-[13px] text-ink-muted mb-1.5">
              Name <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="Enter name"
              className="w-full h-10 px-3 border border-ink-border rounded-md text-[14px] bg-white focus:outline-none focus:border-brand mb-4"
            />

            {tab.hasColor && (
              <>
                <label className="block text-[13px] text-ink-muted mb-1.5">
                  Color
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 ${
                        color === c ? 'border-ink' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="h-10 px-4 rounded-md border border-ink-border text-[13.5px] text-ink hover:bg-ink-bg"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !name.trim()}
                className="h-10 px-5 rounded-md bg-ink text-white text-[13.5px] font-medium disabled:opacity-50 hover:bg-ink/90"
              >
                {saving ? 'Saving…' : editing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
