const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyujlpufeslnxejestai.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('Testing Supabase Connection & Seeding Real Database Data...');

  // 1. STORE SETTINGS
  console.log('\n--- 1. Seeding store_settings ---');
  const storeSettingsData = {
    id: 1,
    store_name: 'BloxyLucy Top Up Robux',
    whatsapp_number: '6287816959979',
    qris_image_path: '/images/qris.webp',
    logo_image_path: '/images/logo.jpeg',
    banner_image_path: '/images/pricelist.jpeg',
    promo_active: true,
    promo_tag: 'PROMO SPESIAL BULAN INI',
    promo_badge: 'LIMITED STOCK',
    promo_title: 'ROBUX BULAN INI',
    promo_subtitle: 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
    promo_robux_amount: 2200,
    promo_original_label: '2.000 Robux',
    promo_discount_price: 45000,
    promo_end_date: '2026-09-30T23:59:59.000Z',
    updated_at: new Date().toISOString(),
  };

  const { data: setRes, error: setErr } = await supabase
    .from('store_settings')
    .upsert(storeSettingsData)
    .select();

  if (setErr) {
    console.error('❌ store_settings error:', setErr.message);
  } else {
    console.log('✅ store_settings successfully seeded:', setRes);
  }

  // 2. PRODUCTS
  console.log('\n--- 2. Seeding products ---');
  const products = [
    {
      id: 1,
      name: 'Paket Hemat',
      robux: 400,
      price: 9000,
      original_price: 12000,
      is_active: true,
      is_popular: false,
      is_best_value: false,
      is_promo: false,
      category: 'Robux',
    },
    {
      id: 2,
      name: 'Paket Populer',
      robux: 1000,
      price: 22000,
      original_price: 25000,
      is_active: true,
      is_popular: true,
      is_best_value: false,
      is_promo: false,
      category: 'Robux',
    },
    {
      id: 3,
      name: 'Paket Spesial Banner Promo',
      robux: 2200,
      price: 45000,
      original_price: 55000,
      is_active: true,
      is_popular: true,
      is_best_value: false,
      is_promo: true,
      category: 'Promo',
    },
    {
      id: 4,
      name: 'Paket Sultan',
      robux: 5000,
      price: 97000,
      original_price: 110000,
      is_active: true,
      is_popular: false,
      is_best_value: true,
      is_promo: false,
      category: 'Robux',
    },
    {
      id: 5,
      name: 'Paket Mega Sultan',
      robux: 10000,
      price: 190000,
      original_price: 220000,
      is_active: true,
      is_popular: false,
      is_best_value: true,
      is_promo: false,
      category: 'Robux',
    },
    {
      id: 6,
      name: 'Paket Ultimate King',
      robux: 30500,
      price: 500000,
      original_price: 600000,
      is_active: true,
      is_popular: false,
      is_best_value: true,
      is_promo: false,
      category: 'Robux',
    },
  ];

  for (const prod of products) {
    const { error: prodErr } = await supabase.from('products').upsert(prod);
    if (prodErr) console.error(`❌ Product ${prod.name} error:`, prodErr.message);
    else console.log(`✅ Product ${prod.name} seeded.`);
  }

  // 3. PROFILES / CUSTOMERS
  console.log('\n--- 3. Seeding profiles ---');
  const profiles = [
    {
      id: 'd9b1c2a3-4567-8901-abcd-ef0123456789',
      roblox_username: 'BloxyGamer99',
      roblox_user_id: '1234567890',
      email: 'bloxygamer@gmail.com',
      phone: '081234567890',
      role: 'member',
      is_blacklisted: false,
    },
    {
      id: 'e1f2a3b4-5678-9012-cdef-1234567890ab',
      roblox_username: 'KawaiiQueen_RBX',
      roblox_user_id: '9876543210',
      email: 'kawaiiqueen@gmail.com',
      phone: '081987654321',
      role: 'member',
      is_blacklisted: false,
    },
    {
      id: 'f2a3b4c5-6789-0123-def0-234567890abc',
      roblox_username: 'SpamUserFake99',
      roblox_user_id: '000111222',
      email: 'fakepayment@mail.com',
      phone: '089999999999',
      role: 'member',
      is_blacklisted: true,
    },
  ];

  for (const prof of profiles) {
    const { error: profErr } = await supabase.from('profiles').upsert(prof);
    if (profErr) console.error(`❌ Profile ${prof.roblox_username} error:`, profErr.message);
    else console.log(`✅ Profile ${prof.roblox_username} seeded.`);
  }

  // 4. ORDERS
  console.log('\n--- 4. Seeding orders ---');
  const orders = [
    {
      id: 1,
      order_code: 'BLX25051801',
      roblox_username: 'BloxyGamer99',
      roblox_user_id: '1234567890',
      customer_email: 'bloxygamer@gmail.com',
      customer_phone: '081234567890',
      robux: 2200,
      price: 45000,
      activation_fee: 10000,
      total_payment: 55000,
      payment_method: 'Website',
      payment_status: 'paid',
      payment_proof_path: '/images/qris.webp',
      order_status: 'completed',
      customer_notes: 'Tolong proses kilat min, mau gacha',
      admin_notes: 'Sudah ditransfer ke Gamepass akun target.',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 2,
      order_code: 'BLX25051802',
      roblox_username: 'KawaiiQueen_RBX',
      roblox_user_id: '9876543210',
      customer_email: 'kawaiiqueen@gmail.com',
      customer_phone: '087812345678',
      robux: 5000,
      price: 97000,
      activation_fee: 0,
      total_payment: 97000,
      payment_method: 'WhatsApp',
      payment_status: 'paid',
      payment_proof_path: '/images/qris.webp',
      order_status: 'processing',
      customer_notes: 'Server VIP Blox Fruits',
      admin_notes: 'Sedang pending roblox 5 hari.',
      created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: 3,
      order_code: 'BLX25051803',
      roblox_username: 'SuperNoobPro',
      roblox_user_id: '1122334455',
      customer_email: 'supernoob@gmail.com',
      customer_phone: '085712345678',
      robux: 1000,
      price: 22000,
      activation_fee: 0,
      total_payment: 22000,
      payment_method: 'Website',
      payment_status: 'pending',
      payment_proof_path: null,
      order_status: 'pending',
      customer_notes: 'Paket hemat',
      admin_notes: '',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      order_code: 'BLX25051804',
      roblox_username: 'MegaSultan_ID',
      roblox_user_id: '5544332211',
      customer_email: 'megasultan@gmail.com',
      customer_phone: '081399887766',
      robux: 10000,
      price: 190000,
      activation_fee: 10000,
      total_payment: 200000,
      payment_method: 'WhatsApp',
      payment_status: 'paid',
      payment_proof_path: '/images/qris.webp',
      order_status: 'awaiting_activation',
      customer_notes: 'Butuh login aktivasi gamepass',
      admin_notes: 'Admin perlu request OTP ke pelanggan.',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      order_code: 'BLX25051805',
      roblox_username: 'ShadowNinja7',
      roblox_user_id: '7788990011',
      customer_email: 'shadowninja@gmail.com',
      customer_phone: '083811223344',
      robux: 3200,
      price: 60000,
      activation_fee: 0,
      total_payment: 60000,
      payment_method: 'WhatsApp',
      payment_status: 'failed',
      order_status: 'cancelled',
      customer_notes: 'Salah pilih paket nominal',
      admin_notes: 'Customer membatalkan pesanan.',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
  ];

  for (const ord of orders) {
    const { error: ordErr } = await supabase.from('orders').upsert(ord);
    if (ordErr) console.error(`❌ Order ${ord.order_code} error:`, ordErr.message);
    else console.log(`✅ Order ${ord.order_code} seeded.`);
  }

  // 5. TESTIMONIALS
  console.log('\n--- 5. Seeding testimonials ---');
  const testimonials = [
    {
      id: 1,
      order_code: 'BLX25051801',
      username: 'Tengkurap420',
      rating: 5,
      robux_package: '10.500 Robux',
      comment: '200k dapet masuk cmn 7 mnit uyyyyy, seller ramah banget mantul pol! Next order lagi disini langganan.',
      proof_amount: '11.4K',
      has_proof: true,
      admin_reply: {
        adminName: 'Admin BloxyLucy Official',
        message: 'Makasih banyak kak sudah order di BloxyLucy! Ditunggu orderan sultan berikutnya yaa 💖✨',
      },
      is_active: true,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      order_code: 'BLX25051802',
      username: 'Rizky_RBXGamer',
      rating: 5,
      robux_package: '5.000 Robux',
      comment: 'Awalnya ragu karena baru pertama kali beli, eh ternyata beneran masuk dan aman 100%. Recommended banget buat yang mau top up robux!',
      proof_amount: '5.2K',
      has_proof: true,
      admin_reply: null,
      is_active: true,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      order_code: 'BLX25051804',
      username: 'PutriBlox_Cute',
      rating: 5,
      robux_package: '2.200 Robux',
      comment: 'Adminnya fast respon dan sabar jelasin caranya. Robux langsung landing tanpa nunggu lama-lama. Makasih min!',
      proof_amount: '2.3K',
      has_proof: true,
      admin_reply: {
        adminName: 'Admin BloxyLucy Official',
        message: 'Sama-sama kak Putri! Selamat bermain Roblox yaa 🌸',
      },
      is_active: true,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const t of testimonials) {
    const { error: tErr } = await supabase.from('testimonials').upsert(t);
    if (tErr) console.error(`❌ Testimonial ${t.username} error:`, tErr.message);
    else console.log(`✅ Testimonial ${t.username} seeded.`);
  }

  console.log('\n✨ Database seeding completed successfully!');
}

main().catch(console.error);
