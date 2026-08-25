import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { AdminHeader } from '../../components/admin/header';
import { AdminSidebar } from '../../components/admin/sidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useBooking } from '../../lib/context';
import { supabase } from '../../lib/supabase';
import type { Cottage, FoodMenuItem, Service } from '../../lib/types';
import { Edit2, Home, ImagePlus, Music, PartyPopper, Plus, Save, Trash2, Utensils, Waves, Wrench, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const tabs = [
  { id: 'videoke', label: 'Videoke', icon: Music },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'food', label: 'Food Services', icon: Utensils },
  { id: 'cottage', label: 'Cottage', icon: Home },
  { id: 'function-hall', label: 'Function Hall', icon: PartyPopper },
] as const;
type TabId = (typeof tabs)[number]['id'];
type ServiceCategory = 'swimming-pool' | 'videoke';
type InventoryStatus = 'available' | 'maintenance' | 'unavailable';
type CottageStatus = 'available' | 'reserved' | 'occupied' | 'maintenance' | 'unavailable';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

const statusLabel: Record<InventoryStatus, string> = { available: 'Available', maintenance: 'Maintenance', unavailable: 'Unavailable' };
const cottageStatusLabel: Record<CottageStatus, string> = { available: 'Available', reserved: 'Reserved', occupied: 'Occupied', maintenance: 'Maintenance', unavailable: 'Unavailable' };

export default function AdminFacilitiesServicesPage() {
  const { services, addService, updateService, deleteService, foodMenuItems, addFoodMenuItem, updateFoodMenuItem, deleteFoodMenuItem, businessInfo, setBusinessInfo, cottages, addCottage, updateCottage, deleteCottage, eventTypePrices, addEventType, updateEventType, deleteEventType } = useBooking();
  const [activeTab, setActiveTab] = useState<TabId>('videoke');
  const [modal, setModal] = useState<'service' | 'food' | 'cottage' | 'event' | null>(null);
  const [editing, setEditing] = useState<Service | FoodMenuItem | Cottage | null>(null);
  const [poolHours, setPoolHours] = useState(businessInfo.poolOperatingHours || '8:00 AM - 8:00 PM');
  const [saving, setSaving] = useState(false);
  const [hallImageFile, setHallImageFile] = useState<File | null>(null);
  const [hallImageSaving, setHallImageSaving] = useState(false);

  const serviceCategory: ServiceCategory | null = activeTab === 'pool' ? 'swimming-pool' : activeTab === 'videoke' ? 'videoke' : null;
  const visibleServices = useMemo(() => serviceCategory ? services.filter((item) => item.category === serviceCategory) : [], [services, serviceCategory]);

  const uploadImage = async (file: File, bucket = 'facility-service-images'): Promise<string> => {
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const saveService = async (form: ServiceForm) => {
    setSaving(true);
    try {
      const image = form.file ? await uploadImage(form.file) : form.image;
      const values: Service = { id: form.id || crypto.randomUUID(), name: form.name, category: form.category, description: form.description, price: Number(form.price), capacity: Number(form.capacity) || undefined, available: form.status === 'available', status: form.status, image };
      if (form.id) await updateService(form.id, values); else await addService(values);
      setModal(null); setEditing(null);
      toast({ title: form.id ? 'Service updated' : 'Service added', description: `${form.name} has been saved.` });
    } catch (error) {
      console.error('Error saving service:', error);
      toast({ title: 'Error saving service', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveFood = async (form: FoodForm) => {
    setSaving(true);
    try {
      const image = form.file ? await uploadImage(form.file) : form.image;
      const values: FoodMenuItem = { id: form.id || crypto.randomUUID(), name: form.name, category: form.category, description: form.description, price: Number(form.price), available: form.status === 'available', status: form.status, image };
      if (form.id) await updateFoodMenuItem(form.id, values); else await addFoodMenuItem(values);
      setModal(null); setEditing(null);
      toast({ title: form.id ? 'Food item updated' : 'Food item added', description: `${form.name} has been saved.` });
    } catch (error) {
      console.error('Error saving food item:', error);
      toast({ title: 'Error saving food item', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveCottage = async (form: CottageForm) => {
    setSaving(true);
    try {
      const image = form.file ? await uploadImage(form.file, 'cottage-images') : form.image;
      const values: Cottage = { id: form.id || crypto.randomUUID(), cottageNumber: form.cottageNumber, name: form.name, description: form.description, pricePerNight: Number(form.price), capacity: Number(form.capacity), status: form.status, image };
      if (form.id) await updateCottage(form.id, values); else await addCottage(values);
      setModal(null); setEditing(null);
      toast({ title: form.id ? 'Cottage updated' : 'Cottage added', description: `${form.name} has been saved.` });
    } catch (error) {
      console.error('Error saving cottage:', error);
      toast({ title: 'Error saving cottage', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveHallImage = async () => {
    if (!hallImageFile) return;
    setHallImageSaving(true);
    try {
      const url = await uploadImage(hallImageFile);
      await setBusinessInfo({ ...businessInfo, functionHallImage: url });
      setHallImageFile(null);
      toast({ title: 'Function hall image updated', description: 'The hall photo is now live for guests to see.' });
    } catch (error) {
      console.error('Error saving hall image:', error);
      toast({ title: 'Error saving image', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setHallImageSaving(false);
    }
  };

  const toggleStatus = (item: Service | FoodMenuItem) => updateServiceOrFood(item, item.status === 'available' ? 'unavailable' : 'available');
  const updateServiceOrFood = (item: Service | FoodMenuItem, status: InventoryStatus) => {
    if ('category' in item && ['swimming-pool', 'videoke'].includes(item.category)) updateService(item.id, { status, available: status === 'available' });
    else updateFoodMenuItem(item.id, { status, available: status === 'available' });
  };

  return <div className="flex h-screen bg-slate-50"><AdminSidebar /><div className="flex min-w-0 flex-1 flex-col overflow-hidden"><AdminHeader /><main className="flex-1 overflow-auto"><div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
    <div className="mb-7"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Admin management</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Facilities and Services</h1><p className="mt-2 text-slate-600">Keep every guest-facing facility, service, and food offering accurate and ready to book.</p></div>
    <div className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={17} />{tab.label}</button>; })}</div>
    {serviceCategory && <ServiceSection title={tabs.find((tab) => tab.id === activeTab)?.label || 'Services'} services={visibleServices} category={serviceCategory} onAdd={() => { setEditing(null); setModal('service'); }} onEdit={(item) => { setEditing(item); setModal('service'); }} onSave={saveService} onDelete={(item) => deleteService(item.id)} onToggle={toggleStatus} />}
    {activeTab === 'food' && <FoodSection items={foodMenuItems} onAdd={() => { setEditing(null); setModal('food'); }} onEdit={(item) => { setEditing(item); setModal('food'); }} onSave={saveFood} onDelete={(item) => deleteFoodMenuItem(item.id)} onToggle={toggleStatus} />}
    {activeTab === 'cottage' && <CottageSection cottages={cottages} onAdd={() => { setEditing(null); setModal('cottage'); }} onEdit={(item) => { setEditing(item); setModal('cottage'); }} onSave={saveCottage} onDelete={(item) => deleteCottage(item.id)} />}
    {activeTab === 'function-hall' && <FunctionHallSection hallImage={businessInfo.functionHallImage} hallImageFile={hallImageFile} setHallImageFile={setHallImageFile} onSaveHallImage={saveHallImage} hallImageSaving={hallImageSaving} eventTypes={eventTypePrices} onAddEvent={() => { setEditing(null); setModal('event'); }} onEditEvent={(et) => { setEditing(et as unknown as Service); setModal('event'); }} onDeleteEvent={(type) => deleteEventType(type)} />}
    {activeTab === 'pool' && <Card className="mt-6"><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end"><div className="flex-1"><label className="mb-2 block text-sm font-semibold text-slate-700">Pool operating hours</label><input className={inputClass} value={poolHours} onChange={(event) => setPoolHours(event.target.value)} /></div><Button onClick={() => setBusinessInfo({ ...businessInfo, poolOperatingHours: poolHours })} className="bg-blue-600 hover:bg-blue-700"><Save size={16} className="mr-2" />Save hours</Button></CardContent></Card>}
  </div></main></div>
    {modal === 'service' && <ServiceModal category={serviceCategory || 'videoke'} item={editing as Service | null} saving={saving} onClose={() => setModal(null)} onSave={saveService} />}
    {modal === 'food' && <FoodModal item={editing as FoodMenuItem | null} saving={saving} onClose={() => setModal(null)} onSave={saveFood} />}
    {modal === 'cottage' && <CottageModal item={editing as Cottage | null} saving={saving} onClose={() => setModal(null)} onSave={saveCottage} />}
    {modal === 'event' && <EventModal item={editing as EventTypeForm | null} saving={saving} onClose={() => setModal(null)} onSave={saveEventTypeForm} />}
  </div>;

  function saveEventTypeForm(form: EventTypeForm) {
    setSaving(true);
    try {
      if (form.id) {
        updateEventType(form.id, form.name, form.description, Number(form.price), Number(form.capacity) || undefined);
        toast({ title: 'Event type updated', description: `${form.name} has been saved.` });
      } else {
        addEventType(form.type, form.name, form.description, Number(form.price), Number(form.capacity) || undefined);
        toast({ title: 'Event type added', description: `${form.name} has been created.` });
      }
      setModal(null); setEditing(null);
    } catch (error) {
      console.error('Error saving event type:', error);
      toast({ title: 'Error saving event type', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }
}

type ServiceForm = { id?: string; name: string; description: string; price: number; capacity: number; category: ServiceCategory; status: InventoryStatus; image?: string; file?: File };
type FoodForm = { id?: string; name: string; description: string; price: number; category: FoodMenuItem['category']; status: InventoryStatus; image?: string; file?: File };
type CottageForm = { id?: string; name: string; cottageNumber: string; description: string; price: number; capacity: number; status: CottageStatus; image?: string; file?: File };
type EventTypeForm = { id: string; type: string; name: string; description: string; price: number; capacity: number };

function ServiceSection({ title, services, category, onAdd, onEdit, onSave, onDelete, onToggle }: { title: string; services: Service[]; category: ServiceCategory; onAdd: () => void; onEdit: (item: Service) => void; onSave: (form: ServiceForm) => void; onDelete: (item: Service) => void; onToggle: (item: Service) => void }) { return <SectionShell title={title} description="Add services, update pricing, and mark items for maintenance." action={<Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700"><Plus size={16} className="mr-2" />Add service</Button>}><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.length ? services.map((item) => <InventoryCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} onToggle={() => onToggle(item)} />) : <Empty text={`No ${title.toLowerCase()} services yet.`} />}</div></SectionShell>; }
function FoodSection({ items, onAdd, onEdit, onSave, onDelete, onToggle }: { items: FoodMenuItem[]; onAdd: () => void; onEdit: (item: FoodMenuItem) => void; onSave: (form: FoodForm) => void; onDelete: (item: FoodMenuItem) => void; onToggle: (item: FoodMenuItem) => void }) { return <SectionShell title="Food Services" description="Manage meals, snacks, drinks, desserts, and packages offered to guests." action={<Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700"><Plus size={16} className="mr-2" />Add food service</Button>}><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.length ? items.map((item) => <InventoryCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} onToggle={() => onToggle(item)} />) : <Empty text="No food services yet." />}</div></SectionShell>; }

function CottageSection({ cottages, onAdd, onEdit, onSave, onDelete }: { cottages: Cottage[]; onAdd: () => void; onEdit: (item: Cottage) => void; onSave: (form: CottageForm) => void; onDelete: (item: Cottage) => void }) {
  return <SectionShell title="Cottages" description="Add and manage individual cottages — name, number, price, capacity, and photo." action={<Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700"><Plus size={16} className="mr-2" />Add cottage</Button>}>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{cottages.length ? cottages.map((item) => <CottageCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />) : <Empty text="No cottages yet. Add your first cottage to get started." />}</div>
  </SectionShell>;
}

function CottageCard({ item, onEdit, onDelete }: { item: Cottage; onEdit: () => void; onDelete: () => void }) {
  return <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
    {item.image && <div className="h-40 bg-slate-100"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>}
    <CardContent className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-bold text-slate-900">{item.name}</h3><p className="mt-1 text-xs text-slate-500">Cottage #{item.cottageNumber}</p></div>
        <CottageStatusBadge status={item.status} />
      </div>
      <p className="min-h-10 text-sm text-slate-600">{item.description || 'No description provided.'}</p>
      <div className="flex items-end justify-between border-t border-slate-100 pt-3">
        <div><p className="text-xl font-bold text-blue-600">₱{item.pricePerNight.toLocaleString()}<span className="text-xs font-normal text-slate-500">/night</span></p><p className="text-xs text-slate-500">{item.capacity} guests</p></div>
        <Button variant="outline" size="sm" onClick={onEdit}><Edit2 size={15} className="mr-2" />Edit</Button>
      </div>
      <Button variant="destructive" className="w-full" onClick={onDelete}><Trash2 size={15} className="mr-2" />Delete cottage</Button>
    </CardContent>
  </Card>;
}

function CottageStatusBadge({ status }: { status: CottageStatus }) {
  const classes: Record<CottageStatus, string> = { available: 'bg-green-100 text-green-800', reserved: 'bg-blue-100 text-blue-800', occupied: 'bg-purple-100 text-purple-800', maintenance: 'bg-amber-100 text-amber-800', unavailable: 'bg-red-100 text-red-800' };
  return <Badge className={classes[status]}>{cottageStatusLabel[status]}</Badge>;
}

function FunctionHallSection({ hallImage, hallImageFile, setHallImageFile, onSaveHallImage, hallImageSaving, eventTypes, onAddEvent, onEditEvent, onDeleteEvent }: { hallImage?: string; hallImageFile: File | null; setHallImageFile: (f: File | null) => void; onSaveHallImage: () => void; hallImageSaving: boolean; eventTypes: { type: string; name: string; description: string; price: number; capacity?: number }[]; onAddEvent: () => void; onEditEvent: (et: { type: string; name: string; description: string; price: number; capacity?: number }) => void; onDeleteEvent: (type: string) => void }) {
  const onFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) setHallImageFile(file); };
  return <>
    <SectionShell title="Function Hall" description="Upload a photo of the hall so guests can see the venue, and manage the event types offered." action={null}>
      <Card className="overflow-hidden">
        {hallImage && !hallImageFile && <div className="h-64 bg-slate-100"><img src={hallImage} alt="Function Hall" className="h-full w-full object-cover" /></div>}
        {hallImageFile && <div className="h-64 bg-slate-100"><img src={URL.createObjectURL(hallImageFile)} alt="Preview" className="h-full w-full object-cover" /></div>}
        {!hallImage && !hallImageFile && <div className="flex h-64 items-center justify-center bg-slate-50 text-slate-400"><Home size={48} /></div>}
        <CardContent className="space-y-3 p-5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            <ImagePlus size={18} className="text-blue-600" />
            <span>{hallImageFile?.name || hallImage ? 'Change hall photo' : 'Upload function hall photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
          {hallImageFile && <Button disabled={hallImageSaving} onClick={onSaveHallImage} className="w-full bg-blue-600 hover:bg-blue-700">{hallImageSaving ? 'Saving...' : 'Save hall photo'}</Button>}
        </CardContent>
      </Card>
    </SectionShell>
    <div className="mt-8">
      <SectionShell title="Event Types" description="Add the kinds of events the function hall hosts — birthday, wedding, corporate, etc." action={<Button onClick={onAddEvent} className="bg-blue-600 hover:bg-blue-700"><Plus size={16} className="mr-2" />Add event</Button>}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{eventTypes.length ? eventTypes.map((et) => (
          <Card key={et.type} className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-900">{et.name}</h3><Badge className="bg-blue-100 text-blue-800">{et.type}</Badge></div>
              <p className="min-h-10 text-sm text-slate-600">{et.description || 'No description provided.'}</p>
              <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                <div><p className="text-xl font-bold text-blue-600">₱{et.price.toLocaleString()}</p>{et.capacity && <p className="text-xs text-slate-500">{et.capacity} guests</p>}</div>
                <Button variant="outline" size="sm" onClick={() => onEditEvent(et)}><Edit2 size={15} className="mr-2" />Edit</Button>
              </div>
              <Button variant="destructive" className="w-full" onClick={() => onDeleteEvent(et.type)}><Trash2 size={15} className="mr-2" />Delete event</Button>
            </CardContent>
          </Card>
        )) : <Empty text="No event types yet. Add your first event to get started." />}</div>
      </SectionShell>
    </div>
  </>;
}

type InventoryCardItem = { id: string; name: string; description?: string; price: number; capacity?: number; available: boolean; status?: InventoryStatus; image?: string };
function InventoryCard({ item, onEdit, onDelete, onToggle }: { item: InventoryCardItem; onEdit: () => void; onDelete: () => void; onToggle: () => void }) { const status = item.status || (item.available ? 'available' : 'unavailable'); return <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">{item.image && <div className="h-40 bg-slate-100"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>}<CardContent className="space-y-3 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{item.name}</h3>{'category' in item && <p className="mt-1 text-xs capitalize text-slate-500">{(item as Service | FoodMenuItem).category.replace('-', ' ')}</p>}</div><StatusBadge status={status} /></div><p className="min-h-10 text-sm text-slate-600">{item.description || 'No description provided.'}</p><div className="flex items-end justify-between border-t border-slate-100 pt-3"><div><p className="text-xl font-bold text-blue-600">₱{item.price.toLocaleString()}</p><p className="text-xs text-slate-500">{item.capacity ? `${item.capacity} guests` : 'Flexible capacity'}</p></div><Button variant="outline" size="sm" onClick={onEdit}><Edit2 size={15} className="mr-2" />Edit</Button></div><div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => onToggle()}>{status === 'available' ? 'Mark unavailable' : 'Mark available'}</Button>{'category' in item && <Button variant="destructive" onClick={onDelete}><Trash2 size={15} /></Button>}</div></CardContent></Card>; }
function StatusBadge({ status }: { status: InventoryStatus }) { return <Badge className={status === 'available' ? 'bg-green-100 text-green-800' : status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>{status === 'maintenance' && <Wrench size={12} className="mr-1" />}{statusLabel[status]}</Badge>; }
function SectionShell({ title, description, action, children }: { title: string; description: string; action?: ReactNode; children: ReactNode }) { return <><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-slate-600">{description}</p></div>{action}</div>{children}</>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 md:col-span-2 lg:col-span-3">{text}</div>; }

function ServiceModal({ category, item, saving, onClose, onSave }: { category: ServiceCategory; item: Service | null; saving: boolean; onClose: () => void; onSave: (form: ServiceForm) => void }) { const [form, setForm] = useState<ServiceForm>({ id: item?.id, name: item?.name || '', description: item?.description || '', price: item?.price || 0, capacity: item?.capacity || 0, category, status: item?.status || 'available', image: item?.image }); const onFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) setForm({ ...form, file }); }; return <Modal title={item ? 'Edit service' : 'Add service'} onClose={onClose}><div className="space-y-4">{form.image && <img src={form.image} alt="Preview" className="h-40 w-full rounded-xl object-cover" />}<input className={inputClass} placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><textarea className={inputClass} rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><div className="grid grid-cols-2 gap-3"><input className={inputClass} type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /><input className={inputClass} type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InventoryStatus })}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="unavailable">Unavailable</option></select><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600"><ImagePlus size={18} className="text-blue-600" /><span>{form.file?.name || form.image ? 'Change photo' : 'Upload service photo'}</span><input type="file" accept="image/*" className="hidden" onChange={onFile} /></label><Button disabled={saving || !form.name.trim()} onClick={() => onSave(form)} className="w-full bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : 'Save changes'}</Button></div></Modal>; }

function FoodModal({ item, saving, onClose, onSave }: { item: FoodMenuItem | null; saving: boolean; onClose: () => void; onSave: (form: FoodForm) => void }) { const [form, setForm] = useState<FoodForm>({ id: item?.id, name: item?.name || '', description: item?.description || '', price: item?.price || 0, category: item?.category || 'meal', status: item?.status || 'available', image: item?.image }); return <Modal title={item ? 'Edit food service' : 'Add food service'} onClose={onClose}><InventoryForm form={form} setForm={setForm} fileLabel="Upload food photo" onSubmit={() => onSave(form)} saving={saving} food /></Modal>; }
function InventoryForm({ form, setForm, fileLabel, onSubmit, saving, food }: { form: FoodForm; setForm: (form: any) => void; fileLabel: string; onSubmit: () => void; saving: boolean; food?: boolean }) { const update = (key: string, value: unknown) => setForm({ ...form, [key]: value }); const onFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) update('file', file); }; return <div className="space-y-4"><input className={inputClass} placeholder={food ? 'Food or package name' : 'Service name'} value={form.name} onChange={(event) => update('name', event.target.value)} /><textarea className={inputClass} rows={3} placeholder="Description" value={form.description} onChange={(event) => update('description', event.target.value)} /><div className="grid grid-cols-2 gap-3"><input className={inputClass} type="number" min="0" placeholder="Price" value={form.price} onChange={(event) => update('price', Number(event.target.value))} /><input className={inputClass} type="number" min="1" placeholder="Capacity" value={0} onChange={(event) => update('capacity', Number(event.target.value))} /></div>{food && <select className={inputClass} value={(form as FoodForm).category} onChange={(event) => update('category', event.target.value)}>{['meal', 'snack', 'beverage', 'dessert', 'package'].map((value) => <option key={value} value={value}>{value}</option>)}</select>}<select className={inputClass} value={form.status} onChange={(event) => update('status', event.target.value)}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="unavailable">Unavailable</option></select><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600"><ImagePlus size={18} className="text-blue-600" /><span>{(form as FoodForm).file?.name || fileLabel}</span><input type="file" accept="image/*" className="hidden" onChange={onFile} /></label><Button disabled={saving || !form.name.trim()} onClick={onSubmit} className="w-full bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : 'Save changes'}</Button></div>; }

function CottageModal({ item, saving, onClose, onSave }: { item: Cottage | null; saving: boolean; onClose: () => void; onSave: (form: CottageForm) => void }) {
  const [form, setForm] = useState<CottageForm>({ id: item?.id, name: item?.name || '', cottageNumber: item?.cottageNumber || '', description: item?.description || '', price: item?.pricePerNight || 0, capacity: item?.capacity || 1, status: item?.status || 'available', image: item?.image });
  const onFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) setForm({ ...form, file }); };
  return <Modal title={item ? 'Edit cottage' : 'Add cottage'} onClose={onClose}>
    <div className="space-y-4">
      {form.image && <img src={form.image} alt="Preview" className="h-40 w-full rounded-xl object-cover" />}
      <input className={inputClass} placeholder="Cottage name (e.g. Family Cottage)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={inputClass} placeholder="Cottage number (e.g. C1)" value={form.cottageNumber} onChange={(e) => setForm({ ...form, cottageNumber: e.target.value })} />
      <textarea className={inputClass} rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className={inputClass} type="number" min="0" placeholder="Price per night" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input className={inputClass} type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
      </div>
      <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CottageStatus })}>
        <option value="available">Available</option>
        <option value="reserved">Reserved</option>
        <option value="occupied">Occupied</option>
        <option value="maintenance">Maintenance</option>
        <option value="unavailable">Unavailable</option>
      </select>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
        <ImagePlus size={18} className="text-blue-600" />
        <span>{form.file?.name || form.image ? 'Change photo' : 'Upload cottage photo'}</span>
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>
      <Button disabled={saving || !form.name.trim() || !form.cottageNumber.trim()} onClick={() => onSave(form)} className="w-full bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : 'Save changes'}</Button>
    </div>
  </Modal>;
}

function EventModal({ item, saving, onClose, onSave }: { item: EventTypeForm | null; saving: boolean; onClose: () => void; onSave: (form: EventTypeForm) => void }) {
  const [form, setForm] = useState<EventTypeForm>(item || { id: '', type: '', name: '', description: '', price: 0, capacity: 0 });
  return <Modal title={item?.id ? 'Edit event type' : 'Add event type'} onClose={onClose}>
    <div className="space-y-4">
      <input className={inputClass} placeholder="Event type (e.g. birthday, wedding)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!!item?.id} />
      <input className={inputClass} placeholder="Display name (e.g. Birthday Party)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <textarea className={inputClass} rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className={inputClass} type="number" min="0" placeholder="Base price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input className={inputClass} type="number" min="0" placeholder="Capacity (optional)" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
      </div>
      <Button disabled={saving || !form.name.trim() || !form.type.trim()} onClick={() => onSave(form)} className="w-full bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : 'Save changes'}</Button>
    </div>
  </Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>{children}</div></div>; }
