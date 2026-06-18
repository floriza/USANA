# Production Readiness Checklist

## Security
- [ ] All environment variables set (no placeholder values)
- [ ] NEXTAUTH_SECRET generated with `openssl rand -base64 32`
- [ ] Strong PostgreSQL password (16+ chars, mixed)
- [ ] Rate limiting configured in nginx.conf
- [ ] Security headers active (X-Frame-Options, CSP, HSTS)
- [ ] CSRF protection via Auth.js
- [ ] SQL injection protected via Prisma parameterized queries
- [ ] XSS protection via React's built-in escaping + CSP headers
- [ ] Admin accounts use strong unique passwords
- [ ] Default admin password changed from `Admin@123456`

## Compliance (MANDATORY)
- [ ] Footer shows "Independent USANA Distributor" notice
- [ ] All product pages show FDA disclaimer
- [ ] Health disclaimer visible on homepage and product pages
- [ ] Compliance checker seeded with banned phrases
- [ ] Review moderation enabled (all reviews pending approval)
- [ ] No disease claims in any product descriptions
- [ ] Distributor name/ID configured in Settings
- [ ] Privacy Policy page live
- [ ] Terms & Conditions page live
- [ ] Cookie Policy page live
- [ ] Data Privacy Act compliance notice live
- [ ] Consent logging active for registrations

## Performance
- [ ] Image optimization via next/image
- [ ] Static assets served via CDN (Cloudflare R2)
- [ ] Server Components used for data-fetching pages
- [ ] Database indexes verified (run `EXPLAIN ANALYZE` on slow queries)
- [ ] Lighthouse score > 90 on mobile

## Payments
- [ ] PayMongo **live** keys configured (not test keys)
- [ ] Webhook secret configured and verified
- [ ] Test payment flow end-to-end
- [ ] Duplicate payment protection verified
- [ ] Refund flow tested

## Emails
- [ ] Resend API key active
- [ ] From email domain verified in Resend
- [ ] Order confirmation email tested
- [ ] Shipment notification email tested
- [ ] Password reset email tested
- [ ] Low stock alert email tested

## Database
- [ ] Production migrations applied (`prisma migrate deploy`)
- [ ] Database seeded with categories and compliance data
- [ ] Automated daily backups configured
- [ ] Point-in-time recovery tested

## Monitoring
- [ ] Health check endpoint monitored (`/api/health`)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Uptime monitoring active (UptimeRobot / BetterUptime)
- [ ] Log aggregation configured

## SEO
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt correct at `/robots.txt`
- [ ] Google Search Console verified
- [ ] Product structured data (Schema.org) rendering
- [ ] Open Graph tags verified with Facebook Debugger
- [ ] Canonical URLs set on all pages

## Shipping
- [ ] At least one courier configured in ShippingRate table
- [ ] Shipping zones cover Metro Manila, Luzon, Visayas, Mindanao
- [ ] Free shipping threshold configured (default ₱2,000)

## Launch Day
- [ ] Announce as Independent USANA Distributor (never as USANA Corporate)
- [ ] Test complete purchase flow with real payment
- [ ] Verify order confirmation email received
- [ ] Test admin order status updates
- [ ] Verify reward points awarded after purchase
- [ ] Test coupon code application at checkout
- [ ] Verify low stock alerts working
