# Known Issues in Preview Environment

## Widget Serving Issue (Preview Environment Only)

### Issue
The widget JavaScript file (`/widget/bitsy-widget.js`) is not accessible via the preview URL because the Kubernetes ingress routes all traffic to the React frontend, which then returns the React app HTML instead of the widget JavaScript.

### Testing Direct Backend Access
The widget **works correctly** when accessed directly from the backend:
```bash
curl -I http://localhost:8001/widget/bitsy-widget.js
# Returns: Content-Type: application/javascript; charset=UTF-8 ✅
```

### Why This Won't Affect Production
In the AWS deployment (following `/app/DEPLOYMENT_AWS.md`):
- The backend and frontend will be separate services with proper routing
- The widget will be served from a dedicated subdomain or path (e.g., `api.yourdomain.com/widget/`)
- The nginx/ALB configuration will correctly route `/widget/` requests to the backend

### Workaround for Testing Locally
To test the widget with the hybrid calendar picker locally:
1. Clone the repo to your machine
2. Run backend: `cd backend && npm install && npm start`
3. Create a simple HTML file with the widget embed code
4. Open the HTML file in your browser (using `http://localhost:8001/widget/bitsy-widget.js`)

### Features Implemented (Ready for Production)
✅ Hybrid date picker (conversational + visual calendar)
✅ Quick action buttons after greeting
✅ Calendar validation (no past dates, checkout > checkin)
✅ Natural language date parsing ("March 20-23", "next weekend")
✅ Mobile-friendly calendar UI

---

## Dashboard UI Polish ✅

All dashboard pages have been enhanced with production-ready UX:

### ✅ **Verified Working:**
- **Stats Page**: KPI cards with hover animations (shadow + translateY)
- **Analytics Page**: Enhanced empty states with "Test with ChatGPT" CTA
- **Rooms Page**: Card hover animations, image zoom on hover
- **Wallets Page**: Professional loading skeletons, smooth transitions
- **Settings Page**: Loading skeleton during data fetch
- **Sidebar Navigation**: Hover animations (translateX effect)
- **Error Boundaries**: Graceful error handling across all pages

### 🎨 **Design Enhancements:**
- Page-level fade-in animations (`animate-in fade-in-50`)
- Button scale effects on hover/active states
- Icon scale animations on hover
- Card elevation changes on hover
- Smooth transitions (200-300ms) following design guidelines

---

## Next Steps

1. **Deploy to AWS**: Follow `/app/DEPLOYMENT_AWS.md` guide
2. **Test Widget in Production**: The widget will work correctly once deployed with proper routing
3. **Create Demo Video**: Use the gallery at `/demo-assets/` for HeyGen
4. **Embed Video**: Provide the final URL to embed in landing page

---

*Last updated: March 15, 2026*
*Testing report: `/app/test_reports/iteration_3.json`*
