// KosanKu Pro - State Engine with Swiper Sliders & Toast Notifications

const state = {
  currentView: 'landing',
  currentRole: 'admin',
  rooms: [
    { id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000, status: 'OCCUPIED', tenant: 'Budi Santoso', floor: 1, image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
    { id: '2', number: 'A-102', type: 'Deluxe Studio Smart', price: 1500000, status: 'AVAILABLE', tenant: null, floor: 1, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
    { id: '3', number: 'B-201', type: 'VIP Balcony Resort', price: 2000000, status: 'OCCUPIED', tenant: 'Siti Rahma', floor: 2, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
    { id: '4', number: 'B-202', type: 'VIP Balcony Resort', price: 2000000, status: 'MAINTENANCE', tenant: null, floor: 2, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
    { id: '5', number: 'C-301', type: 'Standard Smart Suite', price: 1200000, status: 'AVAILABLE', tenant: null, floor: 3, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80' },
    { id: '6', number: 'C-302', type: 'Standard Smart Suite', price: 1200000, status: 'OCCUPIED', tenant: 'Rian Pratama', floor: 3, image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80' },
    { id: '7', number: 'A-103', type: 'Deluxe Garden View', price: 1600000, status: 'AVAILABLE', tenant: null, floor: 1, image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80' },
    { id: '8', number: 'B-203', type: 'VIP Executive Suite', price: 2200000, status: 'AVAILABLE', tenant: null, floor: 2, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
    { id: '9', number: 'C-303', type: 'Standard Smart Suite', price: 1250000, status: 'AVAILABLE', tenant: null, floor: 3, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' },
    { id: '10', number: 'D-401', type: 'Penthouse Loft Suite', price: 2800000, status: 'OCCUPIED', tenant: 'Dion Permana', floor: 4, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
    { id: '11', number: 'D-402', type: 'Penthouse Loft Suite', price: 2800000, status: 'AVAILABLE', tenant: null, floor: 4, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
    { id: '12', number: 'D-403', type: 'Presidential Suite', price: 3200000, status: 'AVAILABLE', tenant: null, floor: 4, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' }
  ],
  reviews: [
    { id: 1, name: 'Budi Santoso', role: 'Software Engineer', room: 'A-101', text: 'Fitur pembayaran QRIS otomatisnya juara banget! Nggak perlu lagi kirim bukti transfer manual. Begitu bayar via Midtrans, langsung terupdate Lunas!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Siti Rahma', role: 'Product Designer', room: 'B-201', text: 'Pernah AC kamar kurang dingin, tinggal isi form tiket komplain di dashboard tenant. Besok harinya teknisi langsung datang benerin. Sangat profesional!', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Rian Pratama', role: 'Financial Analyst', room: 'C-302', text: 'Setiap H-3 sebelum tanggal jatuh tempo, selalu dapat pengingat ramah via WhatsApp. Jadi nggak pernah terlewat bayar atau kena denda.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { id: 4, name: 'Dion Permana', role: 'Senior Consultant', room: 'D-401', text: 'Sistem Smart Lock nya bikin hidup jauh lebih simpel. Tidak perlu bawa kunci fisik ke mana-mana, cukup PIN atau fingerprint.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
  ],
  transactions: [
    { id: 'INV-2026-0701', tenant: 'Budi Santoso', amount: 1604500, method: 'Midtrans Snap', status: 'PENDING', time: '13:30 WIB' },
    { id: 'INV-2026-0601', tenant: 'Siti Rahma', amount: 2000000, method: 'BCA VA (Settled)', status: 'SETTLED', time: 'Kemarin' },
    { id: 'INV-2026-0602', tenant: 'Rian Pratama', amount: 1200000, method: 'QRIS (Settled)', status: 'SETTLED', time: '2 Hari lalu' },
  ],
  complaints: [
    { id: 'TKT-01', title: 'AC Less Cooling', category: 'AC & Pendingin', tenant: 'Budi Santoso', room: 'A-101', status: 'IN_PROGRESS' },
    { id: 'TKT-02', title: 'Water Filter Leakage', category: 'Plumbing', tenant: 'Siti Rahma', room: 'B-201', status: 'OPEN' }
  ],
  notifications: [
    { id: 1, title: 'H-3 Automatic Cron Sent', message: 'WhatsApp ke Budi Santoso (A-101) terkirim via Vercel Cron Endpoint.', time: '08:00 AM' },
    { id: 2, title: 'Midtrans Webhook Settlement', message: 'Invoice INV-2026-0602 telah terbayar via QRIS oleh Rian Pratama.', time: 'Kemarin' },
  ]
};

// WHATSAPP CHATBOT WIDGET LOGIC
function toggleWaChatBox() {
  const box = document.getElementById('waChatBox');
  if (box) {
    box.classList.toggle('hidden');
  }
}

function sendWaPreset(text) {
  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/6281234567890?text=${encodedText}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  render12RoomsSwiper();
  renderReviewsSwiper();
  renderRoomGrid();
  renderTransactionLogs();
  renderTenantTickets();
  renderNotificationLogs();
  navigateTo('landing');
});

// TOAST NOTIFICATION ENGINE (NON-BLOCKING BOTTOM-RIGHT)
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  let icon = 'fa-circle-check text-orchid-tint';
  let borderColor = 'border-purple-300/40';

  if (type === 'info') {
    icon = 'fa-circle-info text-sky-300';
    borderColor = 'border-sky-400/40';
  } else if (type === 'error') {
    icon = 'fa-circle-xmark text-rose-400';
    borderColor = 'border-rose-500/40';
  }

  toast.className = `p-4 bg-slate-900/95 border ${borderColor} text-white rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between text-xs font-bold pointer-events-auto transform transition-all duration-300 translate-y-4 opacity-0`;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fa-solid ${icon} text-lg"></i>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white ml-3">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  // Animate Entrance
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 50);

  // Auto Remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// RENDER 12 ROOMS IN SWIPER SLIDER
function render12RoomsSwiper() {
  const wrapper = document.getElementById('roomsSwiperWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  state.rooms.forEach(room => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price);

    slide.innerHTML = `
      <div class="glass-card rounded-3xl overflow-hidden group transition-all duration-300">
        <div class="relative h-52 overflow-hidden">
          <img src="${room.image}" alt="${room.number}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
          <span class="absolute top-4 left-4 px-3 py-1 ${room.status === 'AVAILABLE' ? 'bg-emerald-600/90 text-white' : room.status === 'OCCUPIED' ? 'bg-rose-600/90 text-white' : 'bg-amber-500/90 text-slate-950'} text-[10px] font-black uppercase tracking-wider rounded-full backdrop-blur-md border border-emerald-400/30">
            ${room.status} • Kamar ${room.number}
          </span>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-extrabold text-white">${room.type}</h3>
              <p class="text-xs text-emerald-200/70">Lantai ${room.floor} • Smart Doorlock Access</p>
            </div>
            <div class="text-right">
              <div class="text-lg font-black text-amber-400">${priceFormatted}</div>
              <span class="text-[10px] text-emerald-300/60">/ bulan</span>
            </div>
          </div>
          <button onclick="openRoomDetailModal('${room.id}')" class="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-2xl text-xs font-bold transition-all">
            Lihat Detail & Sewa
          </button>
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  // Initialize Swiper Rooms Slider
  new Swiper('.swiperRooms', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

// RENDER REVIEWS IN SWIPER SLIDER
function renderReviewsSwiper() {
  const wrapper = document.getElementById('reviewsSwiperWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  state.reviews.forEach(rev => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
      <div class="glass-card p-6 rounded-3xl space-y-4 border border-emerald-800 h-full">
        <div class="flex items-center gap-1 text-amber-400 text-sm">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
        </div>
        <p class="text-xs text-emerald-100/90 italic leading-relaxed">
          "${rev.text}"
        </p>
        <div class="flex items-center gap-3 pt-3 border-t border-emerald-800/80">
          <img src="${rev.avatar}" alt="${rev.name}" class="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40">
          <div>
            <h4 class="text-xs font-bold text-white">${rev.name}</h4>
            <p class="text-[10px] text-emerald-300/60">Penghuni Kamar ${rev.room} • ${rev.role}</p>
          </div>
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  // Initialize Swiper Reviews Slider
  new Swiper('.swiperReviews', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

function navigateTo(viewName) {
  state.currentView = viewName;
  const viewLanding = document.getElementById('viewLanding');
  const viewAdmin = document.getElementById('viewAdmin');
  const viewTenant = document.getElementById('viewTenant');
  const publicNav = document.getElementById('publicNav');
  const authenticatedNav = document.getElementById('authenticatedNav');

  if (viewName === 'landing') {
    viewLanding.classList.remove('hidden');
    viewAdmin.classList.add('hidden');
    viewTenant.classList.add('hidden');
    publicNav.classList.remove('hidden');
    publicNav.classList.add('flex');
    authenticatedNav.classList.add('hidden');
    authenticatedNav.classList.remove('flex');
  } else if (viewName === 'admin') {
    viewLanding.classList.add('hidden');
    viewAdmin.classList.remove('hidden');
    viewTenant.classList.add('hidden');
    publicNav.classList.add('hidden');
    publicNav.classList.remove('flex');
    authenticatedNav.classList.remove('hidden');
    authenticatedNav.classList.add('flex');
    switchRole('admin');
  } else if (viewName === 'tenant') {
    viewLanding.classList.add('hidden');
    viewAdmin.classList.add('hidden');
    viewTenant.classList.remove('hidden');
    publicNav.classList.add('hidden');
    publicNav.classList.remove('flex');
    authenticatedNav.classList.remove('hidden');
    authenticatedNav.classList.add('flex');
    switchRole('tenant');
  }
}

function openAllRoomsModal() {
  const modal = document.getElementById('modalAllRooms');
  const grid = document.getElementById('allRoomsModalGrid');
  grid.innerHTML = '';

  state.rooms.forEach(room => {
    const card = document.createElement('div');
    card.className = 'glass-card rounded-2xl overflow-hidden space-y-3 p-4 border border-sapphire-800';
    const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price);

    card.innerHTML = `
      <div class="h-36 rounded-xl overflow-hidden relative">
        <img src="${room.image}" alt="${room.number}" class="w-full h-full object-cover">
        <span class="absolute top-2 left-2 px-2.5 py-0.5 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase rounded-full">
          ${room.status} • Kamar ${room.number}
        </span>
      </div>
      <div class="space-y-1">
        <h4 class="font-extrabold text-white text-sm">${room.type}</h4>
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400 font-medium">Lantai ${room.floor}</span>
          <span class="font-black text-cyan-400">${priceFormatted}</span>
        </div>
      </div>
      <button onclick="closeAllRoomsModal(); openRoomDetailModal('${room.id}');" class="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-bold transition-all">
        Lihat Detail Unit
      </button>
    `;
    grid.appendChild(card);
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAllRoomsModal() {
  const modal = document.getElementById('modalAllRooms');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openRoomDetailModal(roomId) {
  const room = state.rooms.find(r => r.id === roomId) || state.rooms[0];
  const modal = document.getElementById('modalRoomDetail');
  
  document.getElementById('detailRoomImg').src = room.image;
  document.getElementById('detailRoomTitle').innerText = room.type;
  document.getElementById('detailRoomSub').innerText = `Kamar ${room.number} • Lantai ${room.floor} • Dago Bandung`;
  document.getElementById('detailRoomPrice').innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price);
  document.getElementById('detailRoomStatus').innerText = room.status;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeRoomDetailModal() {
  const modal = document.getElementById('modalRoomDetail');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openLoginModal() {
  const modal = document.getElementById('modalAuth');
  const emailInput = document.getElementById('loginEmail');
  emailInput.value = 'admin@kosanku.com';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeLoginModal() {
  const modal = document.getElementById('modalAuth');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function fillCredential(role) {
  const emailInput = document.getElementById('loginEmail');
  if (role === 'admin') {
    emailInput.value = 'admin@kosanku.com';
  } else {
    emailInput.value = 'budi@kosanku.com';
  }
}

// SMART UNIFIED RBAC LOGIN WITH TOAST NOTIFICATION
function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.toLowerCase().trim();

  closeLoginModal();

  if (email.includes('admin')) {
    showToast('Login Berhasil! Selamat datang Admin Kos. Mengarahkan ke Dashboard Admin...', 'success');
    navigateTo('admin');
  } else {
    showToast('Login Berhasil! Selamat datang Budi Santoso (Tenant). Mengarahkan ke Dashboard Tenant...', 'success');
    navigateTo('tenant');
  }
}

function logout() {
  showToast('Anda telah berhasil keluar (Logout).', 'info');
  navigateTo('landing');
}

function switchRole(role) {
  state.currentRole = role;
  const btnAdmin = document.getElementById('btnRoleAdmin');
  const btnTenant = document.getElementById('btnRoleTenant');
  const viewAdmin = document.getElementById('viewAdmin');
  const viewTenant = document.getElementById('viewTenant');

  if (role === 'admin') {
    btnAdmin.classList.add('active-tab');
    btnAdmin.classList.remove('text-emerald-300');
    btnTenant.classList.remove('active-tab');
    btnTenant.classList.add('text-emerald-300');

    viewAdmin.classList.remove('hidden');
    viewTenant.classList.add('hidden');
  } else {
    btnTenant.classList.add('active-tab');
    btnTenant.classList.remove('text-emerald-300');
    btnAdmin.classList.remove('active-tab');
    btnAdmin.classList.add('text-emerald-300');

    viewTenant.classList.remove('hidden');
    viewAdmin.classList.add('hidden');
  }
}

function renderRoomGrid() {
  const grid = document.getElementById('roomGrid');
  if (!grid) return;
  grid.innerHTML = '';

  state.rooms.slice(0, 6).forEach(room => {
    let statusBadge = '';
    let statusBg = '';

    if (room.status === 'AVAILABLE') {
      statusBadge = '<span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase">Available</span>';
      statusBg = 'border-emerald-800 hover:border-emerald-500/40';
    } else if (room.status === 'OCCUPIED') {
      statusBadge = '<span class="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-black uppercase">Occupied</span>';
      statusBg = 'border-emerald-800 hover:border-rose-500/40';
    } else {
      statusBadge = '<span class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black uppercase">Maintenance</span>';
      statusBg = 'border-emerald-800 hover:border-amber-500/40';
    }

    const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(room.price);

    const card = document.createElement('div');
    card.className = `glass-card p-6 rounded-3xl border transition-all duration-300 space-y-4 ${statusBg}`;
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xl font-black text-white tracking-tight">${room.number}</span>
        ${statusBadge}
      </div>
      <div class="space-y-1">
        <div class="text-xs font-extrabold text-slate-200">${room.type}</div>
        <div class="text-xs text-amber-400 font-bold">Lantai ${room.floor} • ${priceFormatted}/bln</div>
      </div>
      <div class="pt-4 border-t border-emerald-800/80 flex items-center justify-between text-xs">
        <span class="text-emerald-200/70 font-medium">${room.tenant ? '👤 ' + room.tenant : 'Kosong'}</span>
        <button onclick="toggleRoomStatus('${room.id}')" class="text-xs font-extrabold text-amber-400 hover:underline">Ubah Status</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function toggleRoomStatus(roomId) {
  const room = state.rooms.find(r => r.id === roomId);
  if (room) {
    if (room.status === 'AVAILABLE') room.status = 'OCCUPIED';
    else if (room.status === 'OCCUPIED') room.status = 'MAINTENANCE';
    else room.status = 'AVAILABLE';
    renderRoomGrid();
    showToast(`Status Kamar ${room.number} diubah menjadi ${room.status}`, 'info');
  }
}

function renderTransactionLogs() {
  const tbody = document.getElementById('transactionLogBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.transactions.forEach(t => {
    let statusClass = t.status === 'SETTLED' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border border-amber-500/30';
    const amountFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(t.amount);

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-emerald-950/50 transition-all';
    tr.innerHTML = `
      <td class="py-4 px-3 font-mono text-xs font-bold text-amber-300">${t.id}</td>
      <td class="py-4 px-3 font-bold text-white">${t.tenant}</td>
      <td class="py-4 px-3 font-extrabold text-emerald-100">${amountFormatted}</td>
      <td class="py-4 px-3">
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusClass}">${t.status}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTenantTickets() {
  const list = document.getElementById('tenantTicketsList');
  if (!list) return;
  list.innerHTML = '';

  state.complaints.forEach(c => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-emerald-950 border border-emerald-800 rounded-2xl text-xs flex items-center justify-between';
    div.innerHTML = `
      <div>
        <div class="font-extrabold text-emerald-100">${c.title}</div>
        <div class="text-[10px] text-emerald-300/60">${c.category} • ${c.id}</div>
      </div>
      <span class="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">${c.status}</span>
    `;
    list.appendChild(div);
  });
}

function handleComplaintSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('complaintTitle').value;

  const newTicket = {
    id: `TKT-0${state.complaints.length + 1}`,
    title: title,
    category: 'Maintenance',
    tenant: 'Budi Santoso',
    room: 'A-101',
    status: 'OPEN'
  };

  state.complaints.unshift(newTicket);
  renderTenantTickets();

  state.notifications.unshift({
    id: Date.now(),
    title: 'Tiket Perbaikan Terkirim',
    message: `Tiket ${newTicket.id} (${title}) telah dikirim.`,
    time: 'Baru saja'
  });
  renderNotificationLogs();

  document.getElementById('complaintForm').reset();
  showToast('Tiket perbaikan berhasil terkirim ke pengelola kos!', 'success');
}

function triggerMidtransPayment() {
  document.getElementById('modalPayment').classList.remove('hidden');
  document.getElementById('modalPayment').classList.add('flex');
}

function closePaymentModal() {
  document.getElementById('modalPayment').classList.add('hidden');
  document.getElementById('modalPayment').classList.remove('flex');
}

function simulatePaymentSettlement(methodName) {
  closePaymentModal();

  const inv = state.transactions.find(t => t.id === 'INV-2026-0701');
  if (inv) {
    inv.status = 'SETTLED';
  }

  state.notifications.unshift({
    id: Date.now(),
    title: 'Pembayaran LUNAS (Midtrans)',
    message: `Tagihan Rp 1.604.500 telah berhasil diselesaikan via ${methodName}.`,
    time: 'Baru saja'
  });
  renderNotificationLogs();
  renderTransactionLogs();

  document.getElementById('tenantTotalAmount').innerHTML = '<span class="text-amber-400 font-extrabold">LUNAS / SETTLED ✓</span>';
  document.getElementById('dueCountdown').innerText = 'Lunas ✓';
  document.getElementById('dueCountdown').className = 'text-2xl font-black text-amber-300 tracking-tight mt-4';

  showToast(`Pembayaran via ${methodName} berhasil diselesaikan! Webhook callback diterima.`, 'success');
}

function triggerManualCronBlast() {
  state.notifications.unshift({
    id: Date.now(),
    title: 'Vercel Cron Trigger Executed',
    message: 'Cron Job Vercel /api/cron/send-reminders berhasil dipicu.',
    time: 'Baru saja'
  });
  renderNotificationLogs();
  showToast('Vercel Cron /api/cron/send-reminders successfully triggered!', 'info');
}

function toggleNotificationDrawer() {
  const drawer = document.getElementById('drawerNotif');
  if (drawer) {
    drawer.classList.toggle('translate-x-full');
  }
}

function renderNotificationLogs() {
  const list = document.getElementById('notifList');
  if (!list) return;
  list.innerHTML = '';

  state.notifications.forEach(n => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-emerald-950 border border-emerald-800 rounded-2xl space-y-1 text-xs';
    div.innerHTML = `
      <div class="flex items-center justify-between font-bold text-white">
        <span>${n.title}</span>
        <span class="text-[10px] text-emerald-300/60 font-normal">${n.time}</span>
      </div>
      <p class="text-emerald-200/70 text-[11px] leading-snug">${n.message}</p>
    `;
    list.appendChild(div);
  });
}
