import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // COMPLIANCE DISCLAIMERS
  // ============================================================
  const disclaimers = [
    {
      key: "fda_disclaimer",
      content:
        "These statements have not been evaluated by the Food and Drug Administration (FDA) Philippines. These products are not intended to diagnose, treat, cure, or prevent any disease.",
    },
    {
      key: "distributor_notice",
      content:
        "This website is operated by an Independent USANA Distributor and is not owned or operated by USANA Health Sciences, Inc.",
    },
    {
      key: "supplement_notice",
      content:
        "Food supplements should not be used as a substitute for a varied diet and healthy lifestyle. Consult your healthcare provider before starting any supplement program.",
    },
  ];

  for (const d of disclaimers) {
    await prisma.complianceDisclaimer.upsert({
      where: { key: d.key },
      create: { ...d, isActive: true },
      update: { content: d.content },
    });
  }

  // ============================================================
  // COMPLIANCE BANNED PHRASES
  // ============================================================
  const bannedPhrases = [
    // Disease claims - BLOCKED
    { phrase: "treats diabetes", category: "disease_claim", severity: "BLOCKED" as const, description: "Disease treatment claim" },
    { phrase: "cures cancer", category: "disease_claim", severity: "BLOCKED" as const, description: "Disease cure claim" },
    { phrase: "cures diabetes", category: "disease_claim", severity: "BLOCKED" as const, description: "Disease cure claim" },
    { phrase: "eliminates arthritis", category: "disease_claim", severity: "BLOCKED" as const, description: "Disease cure claim" },
    { phrase: "prevents heart disease", category: "disease_claim", severity: "BLOCKED" as const, description: "Disease prevention claim" },
    { phrase: "heals kidney failure", category: "disease_claim", severity: "BLOCKED" as const, description: "Disease healing claim" },
    { phrase: "cure for cancer", category: "disease_claim", severity: "BLOCKED" as const, description: "Cancer cure claim" },
    { phrase: "cured my cancer", category: "testimonial_disease", severity: "BLOCKED" as const, description: "Testimonial disease claim" },
    { phrase: "cured my diabetes", category: "testimonial_disease", severity: "BLOCKED" as const, description: "Testimonial disease claim" },
    { phrase: "fixed my kidney disease", category: "testimonial_disease", severity: "BLOCKED" as const, description: "Testimonial disease claim" },
    { phrase: "cancer disappeared", category: "testimonial_disease", severity: "BLOCKED" as const, description: "Testimonial disease claim" },
    // Drug claims - BLOCKED
    { phrase: "prescription replacement", category: "drug_claim", severity: "BLOCKED" as const, description: "Drug replacement claim" },
    { phrase: "medical treatment", category: "drug_claim", severity: "BLOCKED" as const, description: "Medical treatment claim" },
    { phrase: "guaranteed cure", category: "drug_claim", severity: "BLOCKED" as const, description: "Cure guarantee" },
    { phrase: "replaces medication", category: "drug_claim", severity: "BLOCKED" as const, description: "Medication replacement" },
    // Income claims - BLOCKED
    { phrase: "guaranteed income", category: "income_claim", severity: "BLOCKED" as const, description: "Income guarantee" },
    { phrase: "get rich fast", category: "income_claim", severity: "BLOCKED" as const, description: "Get rich claim" },
    { phrase: "earn millions", category: "income_claim", severity: "BLOCKED" as const, description: "Unrealistic income claim" },
    { phrase: "financial freedom guaranteed", category: "income_claim", severity: "BLOCKED" as const, description: "Financial guarantee" },
    // Misleading - CRITICAL
    { phrase: "instant weight loss", category: "misleading", severity: "CRITICAL" as const, description: "Instant results claim" },
    { phrase: "guaranteed results", category: "misleading", severity: "CRITICAL" as const, description: "Results guarantee" },
    { phrase: "miracle supplement", category: "misleading", severity: "CRITICAL" as const, description: "Miracle claim" },
    { phrase: "scientifically guaranteed", category: "misleading", severity: "CRITICAL" as const, description: "False scientific claim" },
    { phrase: "100% cure", category: "misleading", severity: "CRITICAL" as const, description: "Cure guarantee" },
    // Warnings
    { phrase: "lose weight fast", category: "misleading", severity: "WARNING" as const, description: "Rapid weight loss claim" },
    { phrase: "100% effective", category: "misleading", severity: "WARNING" as const, description: "Effectiveness guarantee" },
    { phrase: "no side effects", category: "misleading", severity: "WARNING" as const, description: "Safety guarantee" },
    { phrase: "clinically proven to cure", category: "misleading", severity: "WARNING" as const, description: "Unsubstantiated clinical claim" },
  ];

  for (const phrase of bannedPhrases) {
    await prisma.complianceBannedPhrase.upsert({
      where: { phrase: phrase.phrase },
      create: { ...phrase, isActive: true },
      update: { severity: phrase.severity },
    });
  }

  // ============================================================
  // CATEGORIES
  // ============================================================
  const categories = [
    {
      name: "Supplements",
      slug: "supplements",
      description: "Essential vitamins, minerals, and antioxidants for optimal health",
      sortOrder: 1,
    },
    {
      name: "Nutritionals",
      slug: "nutritionals",
      description: "Complete nutrition for your daily health needs",
      sortOrder: 2,
    },
    {
      name: "Shakes and Weight Management",
      slug: "shakes-and-weight-management",
      description: "Support your weight management goals with USANA shakes",
      sortOrder: 3,
    },
    {
      name: "Healthy Living",
      slug: "healthy-living",
      description: "Products to support a healthy, active lifestyle",
      sortOrder: 4,
    },
    {
      name: "Personal Care",
      slug: "personal-care",
      description: "High-quality personal care and hygiene products",
      sortOrder: 5,
    },
    {
      name: "Skin Care",
      slug: "skin-care",
      description: "Science-based skin care solutions for radiant skin",
      sortOrder: 6,
    },
  ];

  const createdCategories: Record<string, { id: string }> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { ...cat, isActive: true },
      update: { name: cat.name, description: cat.description },
    });
    createdCategories[cat.slug] = created;
  }

  // ============================================================
  // SHIPPING RATES
  // ============================================================
  const shippingRates = [
    { name: "Metro Manila Standard", courier: "MANUAL" as const, zone: "METRO_MANILA" as const, baseRate: 80, ratePerKg: 20, minDays: 1, maxDays: 3 },
    { name: "Luzon Standard", courier: "MANUAL" as const, zone: "LUZON" as const, baseRate: 120, ratePerKg: 25, minDays: 2, maxDays: 5 },
    { name: "Visayas Standard", courier: "MANUAL" as const, zone: "VISAYAS" as const, baseRate: 150, ratePerKg: 30, minDays: 3, maxDays: 7 },
    { name: "Mindanao Standard", courier: "MANUAL" as const, zone: "MINDANAO" as const, baseRate: 160, ratePerKg: 35, minDays: 4, maxDays: 8 },
  ];

  for (const rate of shippingRates) {
    await prisma.shippingRate.upsert({
      where: { courier_zone: { courier: rate.courier, zone: rate.zone } },
      create: { ...rate, isActive: true },
      update: { baseRate: rate.baseRate, ratePerKg: rate.ratePerKg },
    });
  }

  // ============================================================
  // REWARD SETTINGS
  // ============================================================
  const rewardSettings = await prisma.rewardSettings.findFirst();
  if (!rewardSettings) {
    await prisma.rewardSettings.create({
      data: {
        pointsPerPeso: 1,
        pesoPerPoint: 0.5,
        minimumRedemption: 100,
        pointsExpiryDays: 365,
        isActive: true,
      },
    });
  }

  // ============================================================
  // SUPER ADMIN USER
  // ============================================================
  const adminEmail = "admin@usanastore.ph";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin@123456", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Super Admin",
        firstName: "Super",
        lastName: "Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Super Admin created: ${adminEmail} / Admin@123456`);
  }

  // ============================================================
  // SAMPLE PRODUCTS
  // ============================================================
  const sampleProducts = [
    {
      name: "USANA CellSentials Core Minerals",
      sku: "USN-CM-001",
      slug: "usana-cellsentials-core-minerals",
      description: "<p>USANA CellSentials Core Minerals provides a comprehensive array of essential minerals in highly bioavailable forms. Support your body's daily nutritional needs with this foundational supplement designed for optimal cellular health.</p><p>Core Minerals contains chelated minerals for superior absorption, helping you maintain healthy energy levels, immune function, and overall well-being.</p>",
      shortDescription: "Comprehensive mineral supplement for daily cellular health support",
      categorySlug: "supplements",
      price: 2850,
      stockQuantity: 150,
      lowStockThreshold: 20,
      criticalThreshold: 10,
      ingredients: "Calcium (as Calcium Carbonate, Dicalcium Phosphate), Magnesium (as Magnesium Oxide), Zinc (as Zinc Chelate), Selenium (as Sodium Selenate), Copper (as Copper Chelate), Manganese (as Manganese Chelate), Chromium (as Chromium Polynicotinate), Molybdenum (as Sodium Molybdate), Potassium (as Potassium Chloride)",
      directions: "Take 3 tablets daily with meals.",
      warnings: "Keep out of reach of children. Consult a healthcare professional before use if pregnant, nursing, or taking medications.",
      storageInstructions: "Store in a cool, dry place away from direct sunlight.",
      servingSize: "3 tablets",
      servingsPerContainer: 30,
      isFeatured: true,
      isBestseller: true,
      weight: 0.3,
    },
    {
      name: "USANA Mega Antioxidants",
      sku: "USN-MA-001",
      slug: "usana-mega-antioxidants",
      description: "<p>USANA Mega Antioxidants is a comprehensive supplement providing advanced antioxidant protection. Formulated with a broad spectrum of antioxidants including vitamins C and E, beta-carotene, and more.</p><p>Support your body's natural defense against oxidative stress with this science-based antioxidant formula.</p>",
      shortDescription: "Advanced antioxidant protection for daily cellular defense",
      categorySlug: "supplements",
      price: 3200,
      stockQuantity: 120,
      lowStockThreshold: 15,
      criticalThreshold: 8,
      ingredients: "Vitamin C (as Calcium Ascorbate, Ascorbic Acid), Vitamin E (as d-alpha-Tocopheryl Succinate), Beta-Carotene, Vitamin B6 (as Pyridoxine HCl), Folate (as Folic Acid), Vitamin B12 (as Cyanocobalamin), Biotin",
      directions: "Take 3 tablets daily with meals.",
      warnings: "Consult your healthcare professional before use if pregnant or nursing.",
      storageInstructions: "Store below 25°C in a dry place.",
      servingSize: "3 tablets",
      servingsPerContainer: 30,
      isFeatured: true,
      isNewArrival: false,
      weight: 0.3,
    },
    {
      name: "USANA RESET 5-Day Reset Kit",
      sku: "USN-RST-001",
      slug: "usana-reset-5-day-kit",
      description: "<p>The USANA RESET 5-Day Reset Kit is a comprehensive weight management program that helps support healthy weight management goals. This structured program provides balanced nutrition to help you establish better eating habits.</p><p>Includes a variety of USANA's meal replacement shakes and nutritional supplements designed to support your wellness journey.</p>",
      shortDescription: "5-day structured weight management program with meal replacements",
      categorySlug: "shakes-and-weight-management",
      price: 4500,
      salePrice: 3999,
      stockQuantity: 75,
      lowStockThreshold: 10,
      criticalThreshold: 5,
      isFeatured: true,
      isBestseller: true,
      weight: 1.5,
    },
    {
      name: "USANA Nutrimeal Free",
      sku: "USN-NMF-001",
      slug: "usana-nutrimeal-free",
      description: "<p>USANA Nutrimeal Free is a low-glycemic meal replacement shake that provides balanced nutrition without artificial flavors, sweeteners, or colors. Made with a blend of proteins, fiber, and essential nutrients.</p>",
      shortDescription: "Low-glycemic meal replacement shake — clean, balanced nutrition",
      categorySlug: "shakes-and-weight-management",
      price: 2600,
      stockQuantity: 90,
      lowStockThreshold: 15,
      criticalThreshold: 8,
      isFeatured: false,
      isNewArrival: true,
      weight: 0.85,
    },
    {
      name: "USANA Proflavanol C100",
      sku: "USN-PC100-001",
      slug: "usana-proflavanol-c100",
      description: "<p>USANA Proflavanol C100 combines the antioxidant power of grape seed extract with vitamin C for superior free-radical protection. This powerful antioxidant formula supports cardiovascular health and immune function.</p>",
      shortDescription: "Powerful grape seed and vitamin C antioxidant combination",
      categorySlug: "supplements",
      price: 3800,
      stockQuantity: 60,
      lowStockThreshold: 10,
      criticalThreshold: 5,
      isBestseller: true,
      weight: 0.2,
    },
    {
      name: "USANA Sense Purifying Toner",
      sku: "USN-SPT-001",
      slug: "usana-sense-purifying-toner",
      description: "<p>The USANA Sense Purifying Toner helps balance skin's pH while removing residual impurities after cleansing. Formulated with calming botanicals to soothe and refresh skin, leaving it feeling clean and revitalized.</p>",
      shortDescription: "Balancing facial toner with calming botanicals",
      categorySlug: "skin-care",
      price: 1950,
      stockQuantity: 45,
      lowStockThreshold: 10,
      criticalThreshold: 5,
      isNewArrival: true,
      weight: 0.25,
    },
  ];

  for (const product of sampleProducts) {
    const { categorySlug, salePrice, ...rest } = product;
    const category = createdCategories[categorySlug];
    if (!category) continue;

    await prisma.product.upsert({
      where: { sku: product.sku },
      create: {
        ...rest,
        slug: product.slug,
        brand: "USANA",
        status: "ACTIVE",
        categoryId: category.id,
        ...(salePrice && { salePrice }),
      },
      update: {
        name: product.name,
        price: product.price,
        ...(salePrice && { salePrice }),
        status: "ACTIVE",
      },
    });
  }

  // ============================================================
  // SITE SETTINGS
  // ============================================================
  const settings = [
    { key: "site_name", value: "USANA Store Philippines", group: "general", label: "Site Name" },
    { key: "site_tagline", value: "Premium Health Supplements for Your Wellness Journey", group: "general", label: "Site Tagline" },
    { key: "contact_email", value: "info@usanastore.ph", group: "general", label: "Contact Email" },
    { key: "contact_phone", value: "+63 917 XXX XXXX", group: "general", label: "Contact Phone" },
    { key: "free_shipping_threshold", value: "2000", group: "shipping", label: "Free Shipping Threshold (PHP)" },
    { key: "distributor_name", value: "Your Name Here", group: "compliance", label: "Distributor Name" },
    { key: "distributor_id", value: "USANA-PH-XXXXXX", group: "compliance", label: "USANA Distributor ID" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: { ...setting, type: "string" },
      update: { value: setting.value },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - ${disclaimers.length} compliance disclaimers`);
  console.log(`   - ${bannedPhrases.length} banned phrases`);
  console.log(`   - ${categories.length} product categories`);
  console.log(`   - ${shippingRates.length} shipping rates`);
  console.log(`   - ${sampleProducts.length} sample products`);
  console.log(`   - 1 super admin user (admin@usanastore.ph)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
