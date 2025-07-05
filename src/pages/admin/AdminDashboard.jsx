// src/pages/admin/AdminDashboard.jsx - Real API Integration with Drag & Drop
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminTicketsAPI, updateTicketStatusAPI,getCategoriesAPI } from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const saveFiltersToStorage = (filters) => {
    try {
      localStorage.setItem('adminDashboardFilters', JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  };

  const loadFiltersFromStorage = () => {
    try {
      const saved = localStorage.getItem('adminDashboardFilters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
    return {
      selectedCategory: "",
      selectedDateRange: "",
      unreadFilter: "",
      customDateRange: { startDate: "", endDate: "" },
      statusFilter: "Semua"
    };
  };

  const clearPersistedFilters = () => {
    localStorage.removeItem('adminDashboardFilters');
  };
  
  // 1. ALL STATE DEFINITIONS

  const initialFilters = loadFiltersFromStorage();

  const [tickets, setTickets] = useState({
    "tiket-baru": [],
    diproses: [],
    selesai: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.selectedCategory);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(initialFilters.selectedDateRange);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showUnreadDropdown, setShowUnreadDropdown] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState(initialFilters.unreadFilter);
  const [customDateRange, setCustomDateRange] = useState(initialFilters.customDateRange);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);
  const [isDateDropdownVisible, setIsDateDropdownVisible] = useState(false);
  const [isUnreadDropdownVisible, setIsUnreadDropdownVisible] = useState(false);


  // 2. HELPER FUNCTIONS (defined first)
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Kemarin";
      if (diffDays === 0) return "Hari Ini";
      if (diffDays <= 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  // Map API status to display category
  const mapStatusToCategory = (status) => {
    if (!status) return "TAK";

    switch (status.toLowerCase()) {
      case "pending":
      case "new":
      case "open":
        return "TAK";
      case "in_progress":
      case "processing":
      case "assigned":
        return "PROSES";
      case "completed":
      case "resolved":
      case "closed":
        return "SELESAI";
      default:
        return "TAK";
    }
  };

  // Map API status to kanban column - UPDATED
  const mapStatusToColumn = (status) => {
    if (!status) return "tiket-baru";

    switch (status.toLowerCase()) {
      case "pending":
      case "new":
      case "open":
        return "tiket-baru";
      case "in_progress":
      case "processing":
      case "assigned":
        return "diproses";
      case "completed":
      case "resolved":
      case "closed":
        return "selesai";
      default:
        return "tiket-baru";
    }
  };

  // Map column to API status - FIXED
  const mapColumnToStatus = (column) => {
    switch (column) {
      case "tiket-baru":
        return "open";
      case "diproses":
        return "in_progress";
      case "selesai":
        return "closed"; // Try "closed" instead of "completed"
      default:
        return "open";
    }
  };

  // Transform API ticket data to component format
  const transformTicketData = (ticket) => {
    return {
      id: ticket.id,
      sender:
        ticket.anonymous === true
          ? "Anonim"
          : ticket.nama || ticket.name || "Tidak diketahui",
      email:
        ticket.anonymous === true
          ? "anonim@email.com"
          : ticket.email || "tidak diketahui",
      date: formatDate(ticket.created_at),
      subject: ticket.judul || ticket.title || "Tidak ada judul",
      category: mapStatusToCategory(ticket.status),
      categoryType: ticket.category?.name || "Umum",
      subCategory: ticket.sub_category?.name || "Umum",
      priority: ticket.priority || "medium",
      isRead: ticket.read_by_admin === true || ticket.read_by_admin === 1,
      status: ticket.status,
      rawTicket: ticket, // Keep original data for reference
      // Additional admin fields
      nim: ticket.nim || "",
      prodi: ticket.prodi || "",
      semester: ticket.semester || "",
      noHp: ticket.no_hp || "",
      anonymous: ticket.anonymous === true || ticket.anonymous === 1,
      readByAdmin: ticket.read_by_admin === true || ticket.read_by_admin === 1,
      readByDisposisi:
        ticket.read_by_disposisi === true || ticket.read_by_disposisi === 1,
      readByStudent:
        ticket.read_by_student === true || ticket.read_by_student === 1,
      assignedTo: ticket.assigned_to,
      feedback: Math.floor(Math.random() * 5) + 1, // Mock feedback for now
      feedbackType: "warning", // Mock feedback type
    };
  };

  // 3. FILTERING FUNCTIONS (after helper functions)
  // Filter tickets based on selected filters
  const getFilteredTickets = (tickets) => {
    let filtered = tickets;

    // Filter by category
    if (selectedCategory && selectedCategory !== "") {
      filtered = filtered.filter(ticket => {
        // Check both categoryType and raw ticket category name
        const categoryMatches = ticket.categoryType === selectedCategory || ticket.rawTicket?.category?.name === selectedCategory;
        
        console.log(`Filtering ticket ${ticket.id}: categoryType="${ticket.categoryType}", rawCategory="${ticket.rawTicket?.category?.name}", selectedCategory="${selectedCategory}", matches=${categoryMatches}`);
        
        return categoryMatches;
      });
    }

    // Filter by date range
    if (selectedDateRange && selectedDateRange !== "" && selectedDateRange !== "Pilih Rentang") {
      if (selectedDateRange.includes(" - ")) {
        // Custom date range (format: "YYYY-MM-DD - YYYY-MM-DD")
        const [startDateStr, endDateStr] = selectedDateRange.split(" - ");
        const startDate = new Date(startDateStr + "T00:00:00"); // Start of day
        const endDate = new Date(endDateStr + "T23:59:59"); // End of day
        
        filtered = filtered.filter(ticket => {
          const ticketDate = new Date(ticket.rawTicket?.created_at);
          const isInRange = ticketDate >= startDate && ticketDate <= endDate;
          
          console.log(`Filtering ticket ${ticket.id} by date: ticketDate="${ticketDate.toISOString()}", startDate="${startDate.toISOString()}", endDate="${endDate.toISOString()}", isInRange=${isInRange}`);
          
          return isInRange;
        });
      }
    }

    // Filter by read status
    if (unreadFilter && unreadFilter !== "") {
      if (unreadFilter === "Belum Dibaca") {
        filtered = filtered.filter(ticket => {
          const isUnread = !ticket.isRead && !ticket.readByAdmin;
          console.log(`Filtering ticket ${ticket.id} by unread status: isRead=${ticket.isRead}, readByAdmin=${ticket.readByAdmin}, isUnread=${isUnread}`);
          return isUnread;
        });
      } else if (unreadFilter === "Sudah Dibaca") {
        filtered = filtered.filter(ticket => {
          const isRead = ticket.isRead || ticket.readByAdmin;
          console.log(`Filtering ticket ${ticket.id} by read status: isRead=${ticket.isRead}, readByAdmin=${ticket.readByAdmin}, isRead=${isRead}`);
          return isRead;
        });
      }
    }
    return filtered;
  };

  // Apply filtering to all tickets and regroup by status
  const applyFiltersToTickets = () => {
    // Get all tickets from all columns
    const allTickets = [...tickets["tiket-baru"], ...tickets["diproses"], ...tickets["selesai"]];
    
    // Apply filters
    const filteredTickets = getFilteredTickets(allTickets);

    // Regroup filtered tickets by status/column
    const regrouped = {
      "tiket-baru": [],
      diproses: [],
      selesai: [],
    };

    filteredTickets.forEach((ticket) => {
      const status = mapStatusToColumn(ticket.status);
      if (regrouped[status]) {
        regrouped[status].push(ticket);
      }
    });
    
    return regrouped;
  };

  const getTicketCounts = () => {
    const filteredTickets = applyFiltersToTickets();
    const allFiltered = [...filteredTickets["tiket-baru"], ...filteredTickets["diproses"], ...filteredTickets["selesai"]];
    return {
      total: allFiltered.length,
      new: filteredTickets["tiket-baru"].length,
      processing: filteredTickets["diproses"].length,
      completed: filteredTickets["selesai"].length,
    };
  };

  // 4. COMPUTED VALUES (after all functions are defined)
  const filteredTickets = applyFiltersToTickets();
  // const ticketCounts = getTicketCounts();

  const columnConfig = {
    "tiket-baru": {
      title: "TIKET BARU",
      count: filteredTickets["tiket-baru"].length,
      bgColor: "bg-orange-600",
      textColor: "text-white",
    },
    diproses: {
      title: "DIPROSES",
      count: filteredTickets["diproses"].length,
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    selesai: {
      title: "SELESAI",
      count: filteredTickets["selesai"].length,
      bgColor: "bg-green-600",
      textColor: "text-white",
    },
  };

  // 5. USE EFFECTS
  // Load tickets on component mount
  useEffect(() => {
    loadAdminTickets();
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const currentFilters = {
      selectedCategory,
      selectedDateRange,
      unreadFilter,
      statusFilter,
      customDateRange
    };
    saveFiltersToStorage(currentFilters);
  }, [selectedCategory, selectedDateRange, unreadFilter, statusFilter, customDateRange]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategoriesAPI();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const categoryDropdown = event.target.closest('[data-dropdown="category"]');
      const dateDropdown = event.target.closest('[data-dropdown="date"]');
      const unreadDropdown = event.target.closest('[data-dropdown="unread"]');
      
      if (!categoryDropdown && showCategoryDropdown) {
        setShowCategoryDropdown(false);
        setTimeout(() => setIsCategoryDropdownVisible(false), 300);
      }
      if (!dateDropdown && showDateDropdown) {
        setShowDateDropdown(false);
        setTimeout(() => setIsDateDropdownVisible(false), 300);
      }
      if (!unreadDropdown && showUnreadDropdown) {
        setShowUnreadDropdown(false);
        setTimeout(() => setIsUnreadDropdownVisible(false), 300);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showDateDropdown, showUnreadDropdown]);



  // 6. ASYNC FUNCTIONS
  const loadAdminTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const ticketsData = await getAdminTicketsAPI();
      console.log("Received tickets data:", ticketsData);

      // Group tickets by status
      const groupedTickets = {
        "tiket-baru": [],
        diproses: [],
        selesai: [],
      };

      ticketsData.forEach((ticket) => {
        const transformedTicket = transformTicketData(ticket);
        const status = mapStatusToColumn(ticket.status);

        if (groupedTickets[status]) {
          groupedTickets[status].push(transformedTicket);
        }
      });
      setTickets(groupedTickets);
    } catch (error) {
      console.error("Error loading admin tickets:", error);
      setError("Gagal memuat data tiket: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. EVENT HANDLERS
  const handleDragStart = (e, ticket, fromColumn) => {
    console.log(`Drag started: Ticket ${ticket.id} from ${fromColumn}`);
    
    // Store drag data immediately
    setDraggedTicket(ticket);
    setDraggedFrom(fromColumn);
    
    // Set drag effect
    e.dataTransfer.effectAllowed = "move";
    
    // Store ticket data for drop handler (backup method)
    e.dataTransfer.setData("application/json", JSON.stringify({
      ticketId: ticket.id,
      fromColumn: fromColumn
    }));
  };
  
  // 2. handleDragOver - COMPLETE VERSION (no changes needed)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  // 3. handleDrop - COMPLETE VERSION
  const handleDrop = async (e, toColumn, insertIndex = null) => {
    e.preventDefault();
    
    console.log(`Drop event: toColumn=${toColumn}, insertIndex=${insertIndex}`);
    
    // Get drag data (try both methods)
    let dragData = null;
    try {
      const dataTransferData = e.dataTransfer.getData("application/json");
      if (dataTransferData) {
        dragData = JSON.parse(dataTransferData);
      }
    } catch (error) {
      console.log("No dataTransfer data, using state");
    }
    
    // Use stored state as primary method
    const ticket = draggedTicket;
    const fromColumn = draggedFrom || (dragData ? dragData.fromColumn : null);
    
    if (!ticket || !fromColumn) {
      console.log("No ticket or fromColumn found, resetting drag state");
      setDraggedTicket(null);
      setDraggedFrom(null);
      return;
    }
    
    // Handle same-column reordering (NEW LOGIC)
    if (fromColumn === toColumn) {
      console.log("Same column reordering");
      
      // Only proceed if we have a valid insertIndex and it's different from current position
      if (insertIndex !== null) {
        setTickets((prev) => {
          const newTickets = { ...prev };
          const currentColumnTickets = [...newTickets[fromColumn]];
          
          // Find current position of the ticket
          const currentIndex = currentColumnTickets.findIndex(t => t.id === ticket.id);
          
          if (currentIndex === -1) {
            console.log("Ticket not found in current column");
            return prev;
          }
          
          // If dropping at the same position, do nothing
          if (currentIndex === insertIndex || (currentIndex === insertIndex - 1)) {
            console.log("Dropping at same position, no change needed");
            return prev;
          }
          
          // Remove ticket from current position
          const [movedTicket] = currentColumnTickets.splice(currentIndex, 1);
          
          // Calculate new insert position (adjust if moving from earlier position)
          let newInsertIndex = insertIndex;
          if (currentIndex < insertIndex) {
            newInsertIndex = insertIndex - 1;
          }
          
          // Insert at new position
          currentColumnTickets.splice(newInsertIndex, 0, movedTicket);
          
          // Update the column
          newTickets[fromColumn] = currentColumnTickets;
          
          return newTickets;
        });
        
        console.log(`Ticket ${ticket.id} reordered within ${fromColumn}`);
      }
      
      // Reset drag state
      setDraggedTicket(null);
      setDraggedFrom(null);
      return;
    }
  
    // Handle cross-column movement (EXISTING LOGIC)
    try {
      setUpdating(ticket.id);
      console.log(`Updating ticket ${ticket.id} from ${fromColumn} to ${toColumn}`);
  
      // Get new status for API - try multiple options
      let newStatus = mapColumnToStatus(toColumn);
      console.log(`Mapped status: ${newStatus}`);
  
      // Call API to update status
      try {
        await updateTicketStatusAPI(ticket.id, newStatus);
      } catch (error) {
        // If failed, try alternative status names
        if (toColumn === "selesai") {
          console.log("Trying alternative status for 'selesai'...");
          try {
            newStatus = "completed";
            await updateTicketStatusAPI(ticket.id, newStatus);
          } catch (error2) {
            try {
              newStatus = "resolved";
              await updateTicketStatusAPI(ticket.id, newStatus);
            } catch (error3) {
              throw error; // Throw original error if all fail
            }
          }
        } else {
          throw error;
        }
      }
  
      // Update local state with proper positioning
      setTickets((prev) => {
        const newTickets = { ...prev };
  
        // Remove from source column
        newTickets[fromColumn] = newTickets[fromColumn].filter(
          (t) => t.id !== ticket.id
        );
  
        // Update ticket status
        const updatedTicket = {
          ...ticket,
          status: newStatus,
          category: mapStatusToCategory(newStatus),
        };
  
        // Add to target column at specific position
        if (insertIndex !== null && insertIndex >= 0 && insertIndex <= newTickets[toColumn].length) {
          newTickets[toColumn].splice(insertIndex, 0, updatedTicket);
        } else {
          newTickets[toColumn].push(updatedTicket);
        }
  
        return newTickets;
      });
      
      console.log("Ticket status updated successfully to:", newStatus);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      setError("Gagal mengupdate status tiket: " + error.message);
  
      // Show error for 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setUpdating(null);
      setDraggedTicket(null);
      setDraggedFrom(null);
    }
  };
  

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  // 8. UTILITY FUNCTIONS
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "Sedang";
    }
  };

  // Debug function untuk melihat data tiket
  const debugTicketData = () => {
    const allTickets = [...tickets["tiket-baru"], ...tickets["diproses"], ...tickets["selesai"]];
    console.log('=== DEBUG TICKET DATA ===');
    console.log('Total tickets:', allTickets.length);
    console.log('Available categories in tickets:', [...new Set(allTickets.map(t => t.categoryType))]);
    console.log('Available raw categories:', [...new Set(allTickets.map(t => t.rawTicket?.category?.name).filter(Boolean))]);
    console.log('Sample ticket data:', allTickets[0]);
    console.log('Current filters:', { selectedCategory, selectedDateRange, unreadFilter });
  };

  // 9. COMPONENT FUNCTIONS
  const FilterButton = ({ label, count, active, onClick, badgeColor }) => (
    <button
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`text-xs font-semibold px-2 rounded-full ${
            badgeColor || "bg-gray-200 text-gray-800"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const TicketCard = ({ ticket, columnKey }) => {
    const [isDragging, setIsDragging] = useState(false);
  
    return (
      <div
        data-ticket-card
        draggable={!updating}
        // KEY FIX: Force drag to start immediately with mouse events
        onMouseDown={(e) => {
          if (e.button === 0 && !updating) {
            // Force the element to be ready for immediate drag
            e.currentTarget.style.cursor = 'grabbing';
            
            // Add a tiny delay to ensure drag detection works
            setTimeout(() => {
              const element = e.currentTarget;
              if (element) {
                // Force drag readiness
                element.draggable = true;
                element.style.opacity = '0.8';
              }
            }, 10);
          }
        }}
        
        onDragStart={(e) => {
          if (updating === ticket.id) {
            e.preventDefault();
            return;
          }
          
          setIsDragging(true);
          handleDragStart(e, ticket, columnKey);
          
          // Set drag properties immediately
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.dropEffect = "move";
          
          // Reduce delay for drag image
          const dragImage = document.createElement('div');
          dragImage.innerHTML = `📋 #${ticket.id}`;
          dragImage.style.cssText = `
            position: absolute;
            top: -1000px;
            background: #3b82f6;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          `;
          document.body.appendChild(dragImage);
          e.dataTransfer.setDragImage(dragImage, 0, 0);
          
          // Quick cleanup
          setTimeout(() => {
            if (document.body.contains(dragImage)) {
              document.body.removeChild(dragImage);
            }
          }, 50);
        }}
        
        onDragEnd={(e) => {
          console.log("🔴 Drag end");
          setIsDragging(false);
          e.target.style.opacity = '';
          e.target.style.cursor = '';
        }}
        
        onMouseUp={() => {
          // Reset cursor if not dragging
          if (!isDragging) {
            setTimeout(() => {
              const elements = document.querySelectorAll('[data-ticket-card]');
              elements.forEach(el => {
                el.style.cursor = '';
                el.style.opacity = '';
              });
            }, 100);
          }
        }}
        
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          
          // Only click if we're not in a drag state
          setTimeout(() => {
            if (!isDragging) {
              handleTicketClick(ticket.id);
            }
          }, 50);
        }}
        
        className={`bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 transition-all duration-100 ${
          updating === ticket.id
            ? "opacity-50 cursor-wait"
            : isDragging 
            ? "opacity-60 transform rotate-1 scale-105 cursor-grabbing border-blue-500 z-50"
            : "cursor-grab hover:shadow-md hover:border-blue-300"
        }`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          // Force immediate drag readiness
          WebkitUserDrag: !updating ? 'element' : 'none',
          // Reduce transition time for faster response
          transition: 'all 0.1s ease'
        }}
      >
        {/* Checkbox and ID */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 mr-2 rounded"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            />
            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{ticket.id}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {getPriorityLabel(ticket.priority)}
            </span>
            {!ticket.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
        </div>
  
        {/* Date */}
        <div className="text-xs text-gray-500 mb-2">{ticket.date}</div>
  
        {/* Sender Info */}
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-800">{ticket.sender}</div>
          <div className="text-xs text-gray-500 truncate">{ticket.email}</div>
          {ticket.nim && (
            <div className="text-xs text-gray-500">NIM: {ticket.nim}</div>
          )}
        </div>
  
        {/* Subject */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-blue-700 leading-snug line-clamp-2">
            {ticket.subject}
          </h4>
        </div>
  
        {/* Footer with category and status indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              📁 {ticket.categoryType}
            </span>
          </div>
  
          <div className="flex items-center space-x-1">
            {ticket.readByAdmin && (
              <span className="text-green-600" title="Dibaca Admin">
                👨‍💼
              </span>
            )}
            {ticket.readByDisposisi && (
              <span className="text-blue-600" title="Dibaca Disposisi">
                📋
              </span>
            )}
            {ticket.readByStudent && (
              <span className="text-gray-600" title="Dibaca Mahasiswa">
                👁️
              </span>
            )}
          </div>
        </div>
  
        {updating === ticket.id && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  };

  const Column = ({ columnKey, config, tickets: columnTickets }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropPosition, setDropPosition] = useState(null);

    const handleColumnDragOver = (e) => {
      e.preventDefault();
      setIsDragOver(true);
      
      // Calculate drop position
      const columnElement = e.currentTarget;
      const ticketCards = Array.from(columnElement.querySelectorAll('[data-ticket-card]'));
      const mouseY = e.clientY;
      
      let insertIndex = ticketCards.length;
      
      for (let i = 0; i < ticketCards.length; i++) {
        const cardRect = ticketCards[i].getBoundingClientRect();
        const cardMiddle = cardRect.top + cardRect.height / 2;
        
        if (mouseY < cardMiddle) {
          insertIndex = i;
          break;
        }
      }
      
      setDropPosition(insertIndex);
    };

    const handleColumnDragLeave = (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setIsDragOver(false);
        setDropPosition(null);
      }
    };
  
    const handleColumnDrop = (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleDrop(e, columnKey, dropPosition);
      setDropPosition(null);
    };

    return(
    <div
      className="flex-1 bg-gray-50 rounded-lg p-4 min-w-80"
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
    >
      {/* Column Header */}
      <div
        className={`${config.bgColor} ${config.textColor} rounded-lg p-3 mb-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white rounded"></div>
          <span className="font-bold text-sm">{config.title}</span>
          <span className="font-bold text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
            {config.count}
          </span>
        </div>
        <button
          className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
          title="Refresh Column"
          onClick={loadAdminTickets}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Drop Zone Indicator */}
      <div className="min-h-96 relative">
        {columnTickets.length === 0 ? (
          <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span className="text-sm">Tidak ada tiket</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {columnTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                columnKey={columnKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    )
  };

  // 10. LOADING STATE
  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data tiket admin...</p>
          </div>
        </div>
      </div>
    );
  }

  // 11. MAIN RENDER
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Tiket</h1>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-t-lg shadow mb-2 p-4 sticky top-10 z-40 border-black">
        {/* Filters */}
        <div className="flex justify-between items-center pt-6">
          <div className="flex space-x-2">
            {/* Category Filter */}
            <div className="relative" data-dropdown="category">
              <button
                onClick={() => {
                  if (showCategoryDropdown) {
                    setShowCategoryDropdown(false);
                    setTimeout(() => setIsCategoryDropdownVisible(false), 300);
                  } else {
                    setIsCategoryDropdownVisible(true);
                    setTimeout(() => setShowCategoryDropdown(true), 10);
                  }
                }}
                className="border-2 border-gray-400 text-sm px-3 py-2 rounded-lg focus:ring-1 focus:ring-black focus:border-black flex items-center space-x-2 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="currentColor" d="M5 21V5q0-.825.588-1.412T7 3h10q.825 0 1.413.588T19 5v16l-7-3z"/>
                </svg>
                <span>{selectedCategory || "Semua Kategori"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="currentColor" d="m7 10l5 5l5-5z"/>
                </svg>
              </button>
              {isCategoryDropdownVisible && (
                <div className={`absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top ${
                  showCategoryDropdown 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2'
                }`}>
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setShowCategoryDropdown(false);
                      setTimeout(() => setIsCategoryDropdownVisible(false), 300);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    Semua Kategori
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Date Range Filter */}
            <div className="relative" data-dropdown="date">
              <button
                onClick={() => {
                  if (showDateDropdown) {
                    setShowDateDropdown(false);
                    setTimeout(() => setIsDateDropdownVisible(false), 300);
                  } else {
                    setIsDateDropdownVisible(true);
                    setTimeout(() => setShowDateDropdown(true), 10);
                  }
                }}
                className="border-2 border-gray-400 text-sm px-3 py-2 rounded-lg focus:ring-1 focus:ring-black focus:border-black flex items-center space-x-2 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" className="w-4 h-4">
                  <path fill="currentColor" d="M5.673 0a.7.7 0 0 1 .7.7v1.309h7.517v-1.3a.7.7 0 0 1 1.4 0v1.3H18a2 2 0 0 1 2 1.999v13.993A2 2 0 0 1 18 20H2a2 2 0 0 1-2-1.999V4.008a2 2 0 0 1 2-1.999h2.973V.699a.7.7 0 0 1 .7-.699M1.4 7.742v10.259a.6.6 0 0 0 .6.6h16a.6.6 0 0 0 .6-.6V7.756zm5.267 6.877v1.666H5v-1.666zm4.166 0v1.666H9.167v-1.666zm4.167 0v1.666h-1.667v-1.666zm-8.333-3.977v1.666H5v-1.666zm4.166 0v1.666H9.167v-1.666zm4.167 0v1.666h-1.667v-1.666zM4.973 3.408H2a.6.6 0 0 0-.6.6v2.335l17.2.014V4.008a.6.6 0 0 0-.6-.6h-2.71v.929a.7.7 0 0 1-1.4 0v-.929H6.373v.92a.7.7 0 0 1-1.4 0z"/>
                </svg>
                <span>
                  {customDateRange.startDate && customDateRange.endDate 
                    ? `${customDateRange.startDate} - ${customDateRange.endDate}`
                    : "Pilih Rentang"
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDateDropdownVisible && (
                <div className={`absolute top-full mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4 transform transition-all duration-300 ease-out origin-top ${
                  showDateDropdown 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2'
                }`}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Dari Tanggal:</label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({...prev, startDate: e.target.value}))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sampai Tanggal:</label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({...prev, endDate: e.target.value}))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDateRange(customDateRange.startDate && customDateRange.endDate 
                            ? `${customDateRange.startDate} - ${customDateRange.endDate}` 
                            : ""
                          );
                          setShowDateDropdown(false);
                          setTimeout(() => setIsDateDropdownVisible(false), 300);
                        }}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Terapkan
                      </button>
                      <button
                        onClick={() => {
                          setCustomDateRange({startDate: "", endDate: ""});
                          setSelectedDateRange("");
                          setShowDateDropdown(false);
                          setTimeout(() => setIsDateDropdownVisible(false), 300);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Unread Filter */}
            <div className="relative" data-dropdown="unread">
              <button
                onClick={() => {
                  if (showUnreadDropdown) {
                    setShowUnreadDropdown(false);
                    setTimeout(() => setIsUnreadDropdownVisible(false), 300);
                  } else {
                    setIsUnreadDropdownVisible(true);
                    setTimeout(() => setShowUnreadDropdown(true), 10);
                  }
                }}
                className="border-2 border-gray-400 text-sm px-3 py-2 rounded-lg focus:ring-1 focus:ring-black focus:border-black flex items-center space-x-2 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" className="w-4 h-4">
                  <path fill="currentColor" d="M496 128.05A64 64 0 0 0 389.62 80a64.5 64.5 0 0 0-12.71 15.3v.06c-.54.9-1.05 1.82-1.55 2.74l-.24.49c-.42.79-.81 1.59-1.19 2.4c-.12.25-.23.5-.34.75c-.33.73-.65 1.47-.95 2.22c-.13.31-.25.62-.37.93c-.27.7-.53 1.4-.78 2.11l-.36 1.06c-.22.68-.43 1.37-.63 2.06c-.12.39-.23.77-.33 1.16c-.19.67-.35 1.35-.51 2c-.1.41-.2.82-.29 1.23c-.14.68-.27 1.37-.39 2c-.08.42-.16.84-.23 1.26c-.11.7-.2 1.41-.29 2.12c-.05.41-.11.82-.16 1.24c-.08.77-.13 1.54-.19 2.32c0 .36-.06.72-.08 1.08c-.06 1.14-.1 2.28-.1 3.44c0 1 0 2 .08 2.94v.64q.08 1.41.21 2.82l.06.48c.09.85.19 1.69.32 2.52c0 .17 0 .35.07.52c.14.91.31 1.81.49 2.71c0 .22.09.43.13.65c.18.86.38 1.72.6 2.57v.19c.23.89.48 1.76.75 2.63l.21.68c.27.85.55 1.68.85 2.51c.06.18.13.36.2.54c.27.71.55 1.42.84 2.12c.08.21.16.41.25.61c.34.79.69 1.58 1.06 2.36l.33.67c.35.7.7 1.4 1.07 2.09a64.34 64.34 0 0 0 22.14 23.81a62 62 0 0 0 7.62 4.15l.39.18q2.66 1.2 5.43 2.16l.95.32l1.5.47c.45.14.9.26 1.36.39l1.92.5l1.73.4l1.15.23l1.83.33l.94.15c.9.13 1.81.25 2.72.35l.77.07c.73.06 1.47.12 2.21.16l.86.05c1 0 1.94.08 2.92.08c1.16 0 2.3 0 3.44-.1l1.08-.08c.78-.06 1.55-.11 2.32-.19l1.25-.16c.7-.09 1.41-.18 2.11-.29l1.26-.23c.68-.12 1.37-.25 2-.39l1.23-.29c.68-.16 1.36-.32 2-.51c.39-.1.77-.21 1.16-.33c.69-.2 1.38-.41 2.06-.63l1.06-.36c.71-.25 1.41-.51 2.11-.78l.93-.37c.75-.3 1.49-.62 2.22-.95l.75-.34c.81-.38 1.61-.77 2.4-1.19l.49-.24c.92-.5 1.84-1 2.74-1.55h.06A64.5 64.5 0 0 0 480 170.38a63.8 63.8 0 0 0 16-42.33"/>
                  <path fill="currentColor" d="m371.38 202.53l-105.56 82.1a16 16 0 0 1-19.64 0l-144-112a16 16 0 1 1 19.64-25.26L256 251.73l94.22-73.28A95.86 95.86 0 0 1 348.81 80H88a56.06 56.06 0 0 0-56 56v240a56.06 56.06 0 0 0 56 56h336a56.06 56.06 0 0 0 56-56V211.19a95.85 95.85 0 0 1-108.62-8.66"/>
                </svg>
                <span>{unreadFilter || "Belum Dibaca"}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isUnreadDropdownVisible && (
                <div className={`absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 transform transition-all duration-300 ease-out origin-top ${
                  showUnreadDropdown 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2'
                }`}>
                  <button
                    onClick={() => {
                      setUnreadFilter("Belum Dibaca");
                      setShowUnreadDropdown(false);
                      setTimeout(() => setIsUnreadDropdownVisible(false), 300);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    Belum Dibaca
                  </button>
                  <button
                    onClick={() => {
                      setUnreadFilter("Sudah Dibaca");
                      setShowUnreadDropdown(false);
                      setTimeout(() => setIsUnreadDropdownVisible(false), 300);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    Sudah Dibaca
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Reset Filter Button */}
          <button
            className="border-2 border-gray-400 text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center space-x-2 hover:bg-gray-50"
            onClick={() => {
              const defaultFilters = {
                selectedCategory: "",
                selectedDateRange: "",
                unreadFilter: "",
                statusFilter: "Semua",
                customDateRange: { startDate: "", endDate: "" }
              };
              
              setStatusFilter(defaultFilters.statusFilter);
              setSelectedCategory(defaultFilters.selectedCategory);
              setSelectedDateRange(defaultFilters.selectedDateRange);
              setUnreadFilter(defaultFilters.unreadFilter);
              setCustomDateRange(defaultFilters.customDateRange);
              
              // Clear localStorage
              localStorage.removeItem('adminDashboardFilters');
              
              loadAdminTickets();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="w-4 h-4">
              <path fill="currentColor" d="M22.5 9a7.45 7.45 0 0 0-6.5 3.792V8h-2v8h8v-2h-4.383a5.494 5.494 0 1 1 4.883 8H22v2h.5a7.5 7.5 0 0 0 0-15"/>
              <path fill="currentColor" d="M26 6H4v3.171l7.414 7.414l.586.586V26h4v-2h2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8l-7.414-7.415A2 2 0 0 1 2 9.171V6a2 2 0 0 1 2-2h22Z"/>
            </svg>
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {Object.entries(columnConfig).map(([key, config]) => (
          <Column key={key} columnKey={key} config={config} tickets={filteredTickets[key]} />
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Cara Menggunakan
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Drag & drop tiket antar kolom untuk mengubah status. Status akan
              otomatis tersinkronisasi dengan dashboard student.
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>
                • <strong>Tiket Baru:</strong> Status "open" - tiket yang baru
                masuk
              </li>
              <li>
                • <strong>Diproses:</strong> Status "in_progress" - tiket yang
                sedang ditangani
              </li>
              <li>
                • <strong>Selesai:</strong> Status "completed" - tiket yang
                sudah diselesaikan
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;