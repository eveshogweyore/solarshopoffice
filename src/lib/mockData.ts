import { Product, PickupStation, UserProfile, Order } from "../types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Vertex S+ 445W Solar Panel",
    slug: "vertex-s-plus-445w",
    description: "Ultra-high performance dual-glass monocrystalline panel designed for commercial roof systems. Features standard-setting 22.3% efficiency and exceptional structural reliability under extreme heat loads.",
    category: "panels",
    price: 312000,
    installationFee: 45000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmXCg-8spqoWGWowxUWQ1_5JBYVhMBsKuCetFNHk5nhYspu65qPrRcmNaMKTshU8G51UP7R3oiK1KXYcJueXkmHxl_9lFJo1xw8RnZdtG9wp5aI1zTW9Ju71jqMGmAEe80WmPeJSEdQIvRIVnIrPMHACf9ktJzPcu2m1RpaRh5f8__OK3g-wQNvKRZxRALKmImB2kpz0eDMIN_TkYG-Rg_CshCTzfCyDIl_1ZQIic5xCxrWmkF7t38uJV4hD9lSIXQA7CTTsZKURY"
    ],
    specifications: [
      "Power Output: 445W",
      "Efficiency: 22.3%",
      "Open Circuit Voltage: 52.2V",
      "Cell Type: N-Type Monocrystalline",
      "Weight: 21.5 kg",
      "Dimensions: 1762 x 1134 x 30 mm"
    ],
    stock: 45,
    sku: "SSO-PAN-VXS445",
    warranty: "25-Year Performance / 15-Year Product",
    rating: 4.8,
    reviewsCount: 34,
    featured: true
  },
  {
    id: "prod-2",
    name: "Bifacial Double-Glass 550W Panel",
    slug: "bifacial-double-glass-550w",
    description: "Premium bifacial utility-grade module capturing reflected light from the rear surface. Ideal for high-reflectivity commercial ground mounts and concrete office rooftops.",
    category: "panels",
    price: 485000,
    installationFee: 60000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSQwi7aHKqYfyA0aQ-HOubAf16_sBcgHjYGcGEfOkAKvWfzS20SeQBppusEU03hUPZhrOprE6CY4AYVbgMeYOKAFuborbfn3GQBc-ee1ycvns2WF-Sd_SX4alK8JzasqhKXsGnJqxJxAMF_kJUF8VvbzkNyrtfHrqs79FlbP0OhLDf7vSIERViNwzy2oqJgI8BIp8EE3aMSm0UOe_fTh0jpqAXEE9tD5Hj-dMzXvS6Wjz9OSIQvIC4OsNAGRlpv4E4KIzNpdVqfTc"
    ],
    specifications: [
      "Power Output: 550W",
      "Rear Gain: Up to 25%",
      "Efficiency: 21.8%",
      "Open Circuit Voltage: 49.8V",
      "Cell Type: N-Type Bifacial",
      "Dimensions: 2278 x 1134 x 35 mm"
    ],
    stock: 28,
    sku: "SSO-PAN-BFG550",
    warranty: "30-Year Linear Output Warranty",
    rating: 4.9,
    reviewsCount: 19,
    featured: true
  },
  {
    id: "prod-3",
    name: "PowerStack Pro 15k LFP Storage",
    slug: "powerstack-pro-15k",
    description: "Wall-mounted smart battery storage cabinet utilizing Cobalt-Free LFP cells. Built-in battery management system (BMS) with auto-balancing and intelligent cooling for uninterrupted backup power.",
    category: "batteries",
    price: 8450000,
    installationFee: 250000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtf4q27e2QDTSAiH8CJY8wxTK46Gvl2hecKvPMkett7-5mFK82ERs_zvF9H1qY-7J14Gai4sTR497NJ96RBFwXTrk_HAuQwAqug-5hPArygqGKbvsTSqBsrJ-2mBXDocz-Zl0PMd_Hhy020jCjbfZljqM_ffIjZTH9BcdiaGGGH1OeO1iUgOjRnarxbQjdWBo9JCf-7zD3AS1T4F2TahZ-a8mQqkxGp3H-oFYmHcN9XMKBL1oq7uQdEXOsD2TBBrnM31XxOJLPKNs"
    ],
    specifications: [
      "Capacity: 15.4 kWh",
      "Nominal Voltage: 51.2V",
      "Max Charge Current: 150A",
      "Chemistry: LiFePO4 (LFP)",
      "Lifespan: 6000 Cycles @ 80% DoD",
      "Weight: 140 kg"
    ],
    stock: 12,
    sku: "SSO-BAT-PSP15K",
    warranty: "10-Year Full Replacement Warranty",
    rating: 4.9,
    reviewsCount: 42,
    featured: true
  },
  {
    id: "prod-4",
    name: "PowerStack Mini 5.0 kWh Battery",
    slug: "powerstack-mini-5k",
    description: "Compact energy storage block for remote office installations or light network setups. Scalable design enables stacking up to 4 units in parallel.",
    category: "batteries",
    price: 3200000,
    installationFee: 120000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB73F-0xxGvuA3Ad8Nr3cMfJxAaOIOai81dYglyQnuMqNj3sEF4kD0UCmkS4n_f4OidEV15pN0C9Zt1qNADNjHtntOHxVdtJWd_LbxyELE_lGdRERSuFXU8BhJUlJ_F9mBT0GzmUAaRJjEO4_o6okE9SzU1dR82a57xFQPnHv52d34ADZ4sECpHDw0KsX-lESqhehPFa12gvMEARPBL0m8XOpfHLUcu7kALOeNDDQhshymj8QdUv5R8bzlZy6qygmQHhIKUfLqm4fE"
    ],
    specifications: [
      "Capacity: 5.12 kWh",
      "Nominal Voltage: 51.2V",
      "Max Charge Current: 50A",
      "Chemistry: LiFePO4 (LFP)",
      "Expandability: Up to 4 in parallel"
    ],
    stock: 24,
    sku: "SSO-BAT-PSM005",
    warranty: "10-Year Warranty",
    rating: 4.6,
    reviewsCount: 8,
    featured: false
  },
  {
    id: "prod-5",
    name: "Symo Commercial 20.0-3-M Inverter",
    slug: "symo-commercial-20kw",
    description: "Three-phase grid-connected inverter for commercial systems. Features dual MPPT trackers, dynamic peak manager, and native internet data logging APIs.",
    category: "inverters",
    price: 3890000,
    installationFee: 150000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBb7B4Iuzx8vDMllP2IOohV1-T1LYRGGyAtv4FcszLlziyR7obRLwf93mSKFEDCKJMFeC8MDgVkrY2egnYqFhoYAZ_G-6TD-uuT3JLqvjITdzpKEX4Y9Q87KDG71HcVJxC7AOE3ZlPYqOhuL4HxrWA1HwCTtkg9TcKN1FNxoE2M-8osPkjSvBdJi3HQ23IOOkgmcly7r67QFZkO528UQfn0ZXtVF1GcV4LfwpU6-8c1dL8BcK3YxANqkJYhkBj2h5LL-4i8ozCTmgM"
    ],
    specifications: [
      "AC Power Output: 20 kW",
      "Phases: 3-Phase",
      "Max Efficiency: 98.0%",
      "MPP Voltage Range: 268 - 800 V",
      "IP Rating: IP66 Weatherproof",
      "Interfaces: WLAN, Ethernet, Modbus"
    ],
    stock: 15,
    sku: "SSO-INV-SYM20K",
    warranty: "10-Year Product Warranty",
    rating: 4.7,
    reviewsCount: 26,
    featured: true
  },
  {
    id: "prod-6",
    name: "EcoFlow Hybrid Smart 10kW Inverter",
    slug: "ecoflow-hybrid-10kw",
    description: "Advanced single-phase hybrid inverter with built-in battery charging control. Manages generator inputs and grid feeds dynamically for off-grid operation.",
    category: "inverters",
    price: 2150000,
    installationFee: 100000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnA2SA4CE4sqli6mNkovyxwH8JUqczk9rdGzK0CJk0RqLX2gWYAQSnGyc7cAEr16m3Gmu3PSih6EiPJLfPdQWoIX1SYa6sdGq-q7u__DfHN3pRbG09-OpbWE5waZw4po0DYWU_CCrnJWwiDHaf1QAfZwTFUpJg4mWOsWgqs_TfkNdclu4iHAbLAM5T17SOFaYAFXNFGkNe6bT7fygo4umDOfNLS41F_3CtEEp5oTCBo875vh5UGb6Nkz1W3qxx4ARjRT4niYgTluI"
    ],
    specifications: [
      "AC Power Output: 10 kW",
      "Phases: Single Phase",
      "Battery Input Range: 40 - 60 V",
      "Max Efficiency: 97.6%",
      "Weight: 32 kg"
    ],
    stock: 5,
    sku: "SSO-INV-EFH10K",
    warranty: "5-Year Product Warranty",
    rating: 4.5,
    reviewsCount: 14,
    featured: false
  },
  {
    id: "prod-7",
    name: "Terra AC 22kW Wallbox Charger",
    slug: "terra-ac-22kw",
    description: "Premium level-2 electric vehicle charging station with smart load control. Integrates directly with your office solar production to prioritize clean vehicle fueling.",
    category: "chargers",
    price: 1150000,
    installationFee: 80000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoGWWXqCVxUij14tioDg5c8jDcLxUmsjaICPo9NTp1Ev6S4m_7Ot7oq12koif8Kziw3KyjLc8I0kIu1g0-quGY7t9QdjBFBUbYbdrTYHhwcS8aEnPOyogOXVqTM6TMToe-n-jKuokiBkBfkAsZsfQ5-gTcFumDHHDGUbMlRntwyKFpZ0zVhDZYKQXQ7u6XMK_y5rgnZ4rVEs3N_Y9pj6kgqG1i3na5tv9zRqBiJ7XKr5OxV3YqAcbGgWHyEXczsa83XM5p-uiVP70"
    ],
    specifications: [
      "Charge Rate: Up to 22 kW",
      "Connector Type: Type 2 Cable",
      "Communication: OCPP 1.6J, Wifi, Bluetooth",
      "Protection: RCD Type B equivalent, IP54",
      "Authentication: RFID, App Control"
    ],
    stock: 18,
    sku: "SSO-ACC-TAC22K",
    warranty: "3-Year Limited Warranty",
    rating: 4.8,
    reviewsCount: 22,
    featured: true
  },
  {
    id: "prod-8",
    name: "HD-Mounting Kit Flat Roof Array",
    slug: "hd-mounting-kit-roof",
    description: "Heavy-duty aluminum ballast mounting structure with wind-deflectors for 10 solar panels. Non-penetrative system that preserves office building roofing warranties.",
    category: "mounting",
    price: 680000,
    installationFee: 50000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkHnMMPlnj28iHnxq_kzTYt1OH2cvTdkq1cXhToE35YXYz6JdbZn6u0Vw6NGk80pr8Z_d7b7VHQPvV_PTAQ-P0eTpXJEVa2SyL0zOiS9GQVau324ElAcfpMyI1Q-e98K95PWPOC6gaTleJKNVaVSkq9lWx8GsYwHT-ScT96JlyqfZJhCd8ucxbVt--bFodXJR-gDrI4bukVrLjSbdbFkhDNL-JYA3tzMrFe_gEhO-V8R9itlMNdWJTQWKGu4lazL7nkddCAZ4jMyA"
    ],
    specifications: [
      "Capacity: Holds 10 standard panels",
      "Material: High-grade Anodized Aluminum",
      "Wind Rating: Up to 150 km/h",
      "Tilt Angle: Fixed 15 degrees",
      "Weight: 45 kg (unballasted)"
    ],
    stock: 30,
    sku: "SSO-MNT-FLR010",
    warranty: "15-Year Structrual Warranty",
    rating: 4.5,
    reviewsCount: 6,
    featured: false
  }
];

export const MOCK_STATIONS: PickupStation[] = [
  {
    id: "st-1",
    name: "Lagos Mainland Hub",
    address: "Plot 14, Commercial Avenue, Yaba",
    city: "Lagos",
    state: "Lagos State",
    operatingHours: "Mon-Sat: 8:00 AM - 6:00 PM"
  },
  {
    id: "st-2",
    name: "Abuja Central Depot",
    address: "Block G, Wuse Zone 5, Herbert Macaulay Way",
    city: "Abuja",
    state: "FCT",
    operatingHours: "Mon-Fri: 9:00 AM - 5:00 PM"
  },
  {
    id: "st-3",
    name: "Port Harcourt Logistics Station",
    address: "42 Trans Amadi Industrial Layout",
    city: "Port Harcourt",
    state: "Rivers State",
    operatingHours: "Mon-Fri: 8:00 AM - 5:00 PM"
  }
];

export const DEMO_USER: UserProfile = {
  id: "user-cust",
  fullName: "Adebayo Kolawole",
  email: "kola@solarshopoffice.com",
  phone: "+234 803 123 4567",
  role: "CUSTOMER",
  addresses: [
    {
      id: "addr-1",
      label: "HQ Office (Default)",
      fullName: "Adebayo Kolawole (SolarShopOffice)",
      phone: "+234 803 123 4567",
      street: "Suite 401, Energy Plaza, Adeola Odeku St",
      city: "Victoria Island",
      state: "Lagos State",
      zipCode: "100011",
      isDefault: true
    },
    {
      id: "addr-2",
      label: "Warehouse Depot",
      fullName: "Kolawole Operations",
      phone: "+234 803 123 4567",
      street: "Plot 8, Oshodi-Apapa Expressway",
      city: "Ilasamaja",
      state: "Lagos State",
      zipCode: "100263",
      isDefault: false
    }
  ],
  deliveryNotes: "Deliver during office hours (9 AM - 5 PM). Ring reception on arrival."
};

export const DEMO_ADMIN: UserProfile = {
  id: "user-admin",
  fullName: "Chidi Okafor",
  email: "admin@solarshopoffice.com",
  phone: "+234 809 999 8888",
  role: "SUPER_ADMIN",
  addresses: [],
};

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "SSO-2026-98124",
    date: "2026-05-15",
    items: [
      {
        productId: "prod-1",
        name: "Vertex S+ 445W Solar Panel",
        price: 312000,
        quantity: 10,
        installationSelected: true,
        pickupOption: false
      },
      {
        productId: "prod-5",
        name: "Symo Commercial 20.0-3-M Inverter",
        price: 3890000,
        quantity: 1,
        installationSelected: true,
        pickupOption: false
      }
    ],
    subtotal: 7010000,
    tax: 525750, // 7.5% VAT
    installationTotal: 600000, // 45k*10 + 150k
    shippingTotal: 75000,
    grandTotal: 8210750,
    status: "DELIVERED",
    shippingAddress: DEMO_USER.addresses[0],
    paymentMethod: "Bank Transfer",
    installationScheduledDate: "2026-05-18",
    installerNotes: "Installation completed successfully. Rooftop array tested and active."
  },
  {
    id: "ord-2",
    orderNumber: "SSO-2026-99052",
    date: "2026-05-28",
    items: [
      {
        productId: "prod-3",
        name: "PowerStack Pro 15k LFP Storage",
        price: 8450000,
        quantity: 1,
        installationSelected: false,
        pickupOption: true
      }
    ],
    subtotal: 8450000,
    tax: 633750,
    installationTotal: 0,
    shippingTotal: 0, // Pickup
    grandTotal: 9083750,
    status: "PROCESSING",
    pickupStation: "Lagos Mainland Hub",
    pickupDate: "2026-06-02",
    paymentMethod: "Corporate Card"
  }
];
