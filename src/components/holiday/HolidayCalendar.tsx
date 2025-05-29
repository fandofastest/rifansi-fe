"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import { useAuth } from "@/context/AuthContext";
import { 
  getHolidays, 
  createHoliday, 
  updateHoliday, 
  deleteHoliday,
  importHolidays 
} from "@/services/holiday";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface HolidayEvent extends EventInput {
  extendedProps: {
    id: string;
    description?: string;
    isNational: boolean;
  };
}

export default function HolidayCalendar() {
  const { token } = useAuth();
  const [events, setEvents] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HolidayEvent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    isNational: false
  });
  const [importYear, setImportYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<FullCalendar>(null);

  // Pastikan kalendar diupdate setiap kali events berubah
  useEffect(() => {
    if (calendarRef.current && events.length > 0) {
      console.log("Refetching calendar with updated events");
      // Force rerender the calendar
      calendarRef.current.getApi().refetchEvents();
    }
  }, [events]);

  // Fetch holidays when component mounts
  useEffect(() => {
    if (token) {
      fetchHolidays();
    }
  }, [token]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("Token is missing");
      }
      console.log("Fetching holidays...");
      const holidays = await getHolidays(token);
      console.log("Holidays fetched:", holidays);
      
      // Map holidays to calendar events
      const holidayEvents: HolidayEvent[] = holidays.map(holiday => {
        console.log("Processing holiday:", holiday);
        
        // Konversi timestamp milidetik ke format tanggal ISO
        const dateObj = new Date(parseInt(holiday.date));
        const formattedDate = format(dateObj, "yyyy-MM-dd");
        console.log(`Converting date: ${holiday.date} -> ${formattedDate}`);
        
        return {
          id: holiday.id,
          title: holiday.name,
          start: formattedDate,
          backgroundColor: holiday.isNational ? '#EF4444' : '#3B82F6',
          borderColor: holiday.isNational ? '#EF4444' : '#3B82F6',
          textColor: '#FFFFFF',
          allDay: true,
          extendedProps: {
            id: holiday.id,
            description: holiday.description || "",
            isNational: holiday.isNational
          }
        };
      });
      
      console.log("Holiday events prepared:", holidayEvents);
      setEvents(holidayEvents);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Gagal memuat data hari libur");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Format the selected date
    const selectedDate = format(selectInfo.start, "yyyy-MM-dd");
    console.log(`Date selected: ${selectedDate}`);
    
    // Cek apakah tanggal ini sudah memiliki holiday
    const existingHoliday = events.find(event => {
      const eventStartDate = typeof event.start === 'string' 
        ? event.start 
        : format(new Date(event.start as Date), "yyyy-MM-dd");
      return eventStartDate === selectedDate;
    });
    
    if (existingHoliday) {
      console.log("Found existing holiday:", existingHoliday);
      // Jika sudah ada, set sebagai selected event untuk edit
      setSelectedEvent(existingHoliday);
      
      // Dapatkan nilai description dengan pengecekan null/undefined
      const description = existingHoliday.extendedProps.description || "";
      const isNational = !!existingHoliday.extendedProps.isNational;
      
      // Set form data
      setFormData({
        name: existingHoliday.title || "",
        date: selectedDate,
        description, // Sudah dijamin string
        isNational // Sudah dijamin boolean
      });
    } else {
      // Reset form data dan set tanggal yang dipilih
      setFormData({
        name: "",
        date: selectedDate,
        description: "",
        isNational: false
      });
      setSelectedEvent(null);
    }
    
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps as HolidayEvent['extendedProps'];
    
    // Ambil dan pastikan tipe data
    const id = extendedProps.id || "";
    const description = extendedProps.description || "";
    const isNational = !!extendedProps.isNational;
    
    // Set selected event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      extendedProps: {
        id,
        description,
        isNational
      }
    });
    
    // Set form data
    setFormData({
      name: event.title,
      date: event.startStr,
      description,
      isNational
    });
    
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !token) return;
    
    try {
      const success = await deleteHoliday(selectedEvent.extendedProps.id, token);
      if (success) {
        toast.success("Hari libur berhasil dihapus");
        
        // Remove from local state
        setEvents(prevEvents => 
          prevEvents.filter(event => event.id !== selectedEvent.id)
        );
        
        setIsDeleteModalOpen(false);
        setIsModalOpen(false);
      } else {
        toast.error("Gagal menghapus hari libur");
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Gagal menghapus hari libur");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (selectedEvent) {
        // Update existing holiday
        const updatedHoliday = await updateHoliday({
          id: selectedEvent.extendedProps.id,
          name: formData.name,
          date: formData.date,
          description: formData.description,
          isNational: formData.isNational
        }, token);
        
        // Update local state
        setEvents(prevEvents => {
          return prevEvents.map(event => {
            if (event.id === selectedEvent.id) {
              return {
                ...event,
                title: updatedHoliday.name,
                start: updatedHoliday.date,
                backgroundColor: updatedHoliday.isNational ? '#EF4444' : '#3B82F6',
                borderColor: updatedHoliday.isNational ? '#EF4444' : '#3B82F6',
                extendedProps: {
                  ...event.extendedProps,
                  description: updatedHoliday.description || "",
                  isNational: updatedHoliday.isNational
                }
              };
            }
            return event;
          });
        });
        
        toast.success("Hari libur berhasil diperbarui");
      } else {
        // Create new holiday
        const newHoliday = await createHoliday({
          name: formData.name,
          date: formData.date,
          description: formData.description,
          isNational: formData.isNational
        }, token);
        
        // Add to local state
        const newEvent: HolidayEvent = {
          id: newHoliday.id,
          title: newHoliday.name,
          start: newHoliday.date,
          backgroundColor: newHoliday.isNational ? '#EF4444' : '#3B82F6',
          borderColor: newHoliday.isNational ? '#EF4444' : '#3B82F6',
          textColor: '#FFFFFF',
          allDay: true,
          extendedProps: {
            id: newHoliday.id,
            description: newHoliday.description || "",
            isNational: newHoliday.isNational
          }
        };
        
        setEvents(prevEvents => [...prevEvents, newEvent]);
        toast.success("Hari libur berhasil ditambahkan");
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving holiday:", error);
      toast.error("Gagal menyimpan hari libur");
    }
  };

  const handleImportHolidays = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const result = await importHolidays(importYear, token);
      
      if (result.success) {
        toast.success(`Berhasil mengimpor ${result.importedCount} hari libur (${result.skippedCount} dilewati)`);
        fetchHolidays();
      } else {
        toast.error(result.message || "Gagal mengimpor hari libur");
      }
      
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("Error importing holidays:", error);
      toast.error("Gagal mengimpor hari libur");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loader">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 dark:bg-gray-900 sm:px-7.5 xl:pb-1">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Kalender Hari Libur
        </h4>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            Import Hari Libur
          </Button>
          
          <Button
            variant="primary"
            onClick={() => {
              setFormData({
                name: "",
                date: format(new Date(), "yyyy-MM-dd"),
                description: "",
                isNational: false
              });
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
          >
            Tambah Hari Libur
          </Button>
        </div>
      </div>
      
      <div className="holiday-calendar mb-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridYear'
          }}
          views={{
            dayGridMonth: {
              titleFormat: { month: 'long', year: 'numeric' }
            },
            dayGridYear: {
              type: 'dayGrid',
              duration: { years: 1 },
              monthMode: true,
              contentHeight: 'auto',
              titleFormat: { year: 'numeric' }
            }
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={1.5}
          locale="id"
          dayCellClassNames={(arg) => {
            // Cek apakah tanggal ini memiliki event libur nasional
            const date = arg.date;
            const dateStr = format(date, "yyyy-MM-dd");
            
            // Debug: log setiap hari yang diperiksa
            if (date.getDate() === 1 || events.some(event => event.start === dateStr)) {
              console.log(`Checking date: ${dateStr}, events:`, events.filter(event => event.start === dateStr));
            }
            
            const hasNationalHoliday = events.some(event => {
              const eventStartDate = typeof event.start === 'string' 
                ? event.start 
                : format(new Date(event.start as Date), "yyyy-MM-dd");
                
              return eventStartDate === dateStr && event.extendedProps.isNational;
            });
            
            // Debug: log tanggal merah
            if (hasNationalHoliday) {
              console.log(`Found national holiday on: ${dateStr}`);
            }
            
            return hasNationalHoliday ? 'bg-red-50 dark:bg-red-900/20' : '';
          }}
        />
      </div>
      
      {/* Modal untuk tambah/edit hari libur */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="max-w-[500px] p-5"
      >
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          {selectedEvent ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tanggal
            </label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Hari Libur
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Contoh: Tahun Baru"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deskripsi (Opsional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Deskripsi hari libur (opsional)"
              className="w-full rounded border border-stroke bg-white py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isNational"
              name="isNational"
              checked={formData.isNational}
              onChange={(e) => setFormData({...formData, isNational: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isNational" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Hari Libur Nasional
            </label>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            {selectedEvent && (
              <Button
                variant="primary"
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500 hover:bg-red-600"
              >
                Hapus
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const formEvent = new Event('submit') as unknown as React.FormEvent;
                handleSubmit(formEvent);
              }}
            >
              {selectedEvent ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal untuk konfirmasi hapus */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-[400px] p-5"
      >
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Konfirmasi Hapus
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Apakah Anda yakin ingin menghapus hari libur ini?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleDeleteEvent}
            className="bg-red-500 hover:bg-red-600"
          >
            Hapus
          </Button>
        </div>
      </Modal>
      
      {/* Modal untuk import hari libur */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        className="max-w-[400px] p-5"
      >
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Import Hari Libur
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Pilih tahun untuk mengimpor data hari libur nasional.
        </p>
        
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tahun
          </label>
          <Input
            type="number"
            value={importYear}
            onChange={(e) => setImportYear(parseInt(e.target.value) || new Date().getFullYear())}
            min="2000"
            max="2100"
            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleImportHolidays}
          >
            Import
          </Button>
        </div>
      </Modal>
    </div>
  );
} 