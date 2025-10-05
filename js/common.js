const API_BASE_URL = 'http://localhost:3000/api';

async function fetchData(endpoint, params = {}) {
  try {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, value);
      }
    });

    const paramStr = urlParams.toString();
    const fullUrl = `${API_BASE_URL}${endpoint}${paramStr ? `?${paramStr}` : ''}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(fullUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    let result;
    try {
      result = await response.json();
    } catch (jsonErr) {
      throw new Error('Backend returned invalid JSON (backend may not be running or wrong endpoint)');
    }

    if (!response.ok || !result.success) {
      const errorMsg = result.error || `Request failed (HTTP ${response.status})`;
      throw new Error(errorMsg);
    }

    return result.data;

  } catch (err) {
    const errorMsg = err.name === 'AbortError' 
      ? 'Request timed out (check if backend is running)' 
      : err.message;
    
    showErrorMsg(errorMsg);
    throw err;
  }
}

function showErrorMsg(msg) {
  const existingError = document.getElementById('global-error-message');
  if (existingError) {
    existingError.remove();
  }

  const errorEl = document.createElement('div');
  errorEl.id = 'global-error-message';
  errorEl.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 14px 20px;
    background-color: #dc3545;
    color: #fff;
    font-size: 1rem;
    text-align: center;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: opacity 0.5s ease;
  `;
  errorEl.textContent = msg;

  document.body.prepend(errorEl);

  setTimeout(() => {
    errorEl.style.opacity = '0';
    setTimeout(() => {
      if (document.getElementById('global-error-message')) {
        errorEl.remove();
      }
    }, 500);
  }, 3000);
}

function renderNavigation() {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) {
    console.warn('Navigation container not found. Add <div id="nav-container"></div> to the page');
    return;
  }

  const navHtml = `
    <nav style="background-color: #f8f9fa; padding: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center;">
        <a 
          href="index.html" 
          style="font-size: 1.25rem; font-weight: 700; color: #2c3e50; text-decoration: none; white-space: nowrap;"
        >
          CharityConnect
        </a>
        <div style="display: flex; gap: 1.5rem; align-items: center;">
          <a href="index.html" style="color: #343a40; text-decoration: none; font-size: 1rem;">Home</a>
          <a href="search.html" style="color: #343a40; text-decoration: none; font-size: 1rem;">Search Events</a>
          <a 
            href="mailto:contact@sydchildcharity.org" 
            style="color: #343a40; text-decoration: none; font-size: 1rem;"
            title="Send email to contact us"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  `;

  navContainer.innerHTML = navHtml;

  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = navContainer.querySelectorAll('a');

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref.endsWith(currentPage) && !linkHref.startsWith('mailto:')) {
      link.style.color = '#0d6efd';
      link.style.fontWeight = 'bold';
      link.style.textDecoration = 'underline';
      link.style.textUnderlineOffset = '4px';
    }
  });
}

window.fetchData = fetchData;
window.showErrorMsg = showErrorMsg;
window.renderNavigation = renderNavigation;

document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
});