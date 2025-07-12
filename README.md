# AJAS Services - Professional Consulting & Certification

A modern, responsive website for AJAS Services, a professional consulting firm specializing in Quality Management Systems, Food Safety Management Systems, Environmental Management Systems, and Occupational Health & Safety Management Systems.

## 🚀 Features

### Design & User Experience
- **Modern Design System**: Clean, professional layout with corporate appeal
- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Performance Optimized**: Fast loading with optimized assets and lazy loading

### Technical Features
- **Semantic HTML5**: Proper document structure with accessibility in mind
- **Modern CSS**: CSS Grid, Flexbox, Custom Properties, and modern layout techniques
- **Vanilla JavaScript**: No framework dependencies, pure JavaScript functionality
- **PWA Ready**: Service worker, manifest file, and offline capabilities
- **Animation**: Smooth scroll animations using AOS (Animate on Scroll) library

### Interactive Elements
- **Responsive Navigation**: Collapsible hamburger menu for mobile
- **Form Validation**: Real-time validation with error messaging
- **Scroll Animations**: Elements animate in as they come into view
- **Counter Animation**: Animated site view counter
- **Scroll to Top**: Floating action button for easy navigation

## 📁 Project Structure

```
AJASservices/
├── index.html              # Main homepage
├── assets/
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   └── main.js         # JavaScript functionality
│   └── img/                # Image assets (placeholder)
├── favicon.svg             # SVG favicon
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker
└── README.md              # Project documentation
```

## 🎨 Design System

### Color Palette
- **Main Brand**: `#1D4B73` (Deep Navy Blue)
- **Primary UI**: `#215B8D` (Rich Royal Blue)
- **Accent/CTA**: `#D4AF37` (Satin Gold)
- **Light Surface**: `#F5F7FA` (Light Gray)
- **Text Headings**: `#0F2537` (Dark Blue)
- **Text Body**: `#333` (Dark Gray)

### Typography
- **Headings**: Poppins, 600 weight, -0.25px letter-spacing
- **Body**: Roboto, 400 weight, normal letter-spacing

### Components
- **Cards**: Rounded corners (0.75rem), subtle shadows
- **Buttons**: Gold accent color with hover effects
- **Forms**: Floating labels, real-time validation
- **Navigation**: Sticky header with backdrop blur

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Grid, Flexbox, Custom Properties, Animations
- **JavaScript (ES6+)**: Modern JavaScript features
- **AOS Library**: Scroll animations
- **Google Fonts**: Poppins and Roboto
- **PWA**: Service Worker and Web App Manifest

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open** `index.html` in a modern web browser
3. **For development**: Use a local server (recommended)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## 📋 Content Sections

### 1. Hero Section
- **Our Objectives** card with 4 key points
- Professional handshake background
- Animated entrance effects

### 2. Welcome Section
- Company introduction
- W. Edwards Deming quote
- Professional description

### 3. Industries & Services
- Two-column grid layout
- Industries served (10 categories)
- Services offered (10 services)
- Custom bullet styling

### 4. News & Events Sidebar
- Timeline layout
- 4 recent events with dates
- Responsive design

### 5. Contact Form
- Professional enquiry form
- Real-time validation
- Success messaging
- Mobile-responsive layout

### 6. Footer
- Useful website links
- Contact information
- Professional branding

## 🔧 Customization

### Colors
Update the CSS custom properties in `:root`:
```css
:root {
  --clr-main: #1D4B73;
  --clr-primary: #215B8D;
  --clr-accent: #D4AF37;
  /* ... other colors */
}
```

### Content
- Update text content in `index.html`
- Modify form fields as needed
- Add/remove news events
- Update contact information

### Styling
- Modify `assets/css/styles.css` for design changes
- Add new components following the existing pattern
- Update responsive breakpoints if needed

## 📊 Performance Features

- **Optimized Images**: SVG favicon, optimized hero background
- **Lazy Loading**: Images load as they come into view
- **Minified CSS**: Production-ready styles
- **Efficient JavaScript**: Debounced scroll events, optimized animations
- **PWA Caching**: Service worker for offline functionality

## 🔒 Security & Best Practices

- **Form Validation**: Client-side validation with error handling
- **XSS Prevention**: Proper input sanitization
- **HTTPS Ready**: All external resources use HTTPS
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Fallbacks**: Graceful degradation for older browsers

## 📈 SEO Features

- **Semantic HTML**: Proper heading hierarchy
- **Meta Tags**: Description, viewport, theme-color
- **Structured Data**: Ready for schema markup
- **Performance**: Optimized for Core Web Vitals

## 🚀 Deployment

The website is ready for deployment to any static hosting service:

- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Push to a repository
- **Traditional Hosting**: Upload files via FTP

## 📞 Support

For questions or customization requests, please refer to the code comments or contact the development team.

---

**Built with ❤️ using modern web standards and best practices.** 