// Facebook Login Blocker - Content Script
(function() {
    'use strict';

    // Konfigurace blokování
    const config = {
        enabled: true,
        selectors: [
            // Přihlašovací formuláře
            'form[action*="login"]',
            'form[action*="auth"]',
            'form[data-testid="login_form"]',
            'form[data-testid="royal_login_form"]',
            'form[data-testid="login_form"]',
            
            // Přihlašovací tlačítka
            'button[data-testid="royal_login_button"]',
            'button[data-testid="login_button"]',
            'input[type="submit"][value*="Přihlásit"]',
            'input[type="submit"][value*="Log In"]',
            'input[type="submit"][value*="Login"]',
            
            // Přihlašovací pole
            'input[name="email"]',
            'input[name="pass"]',
            'input[name="password"]',
            'input[type="email"]',
            'input[type="password"]',
            
            // Přihlašovací odkazy
            'a[href*="login"]',
            'a[href*="auth"]',
            'a[data-testid="login_link"]',
            
            // Přihlašovací modaly a popupy
            '[data-testid="login_modal"]',
            '[data-testid="auth_dialog"]',
            '.login_dialog',
            '.auth_dialog',
            '.login_modal',
            '.auth_modal',
            
            // Přihlašovací sekce
            '[data-testid="login_section"]',
            '.login_section',
            '.auth_section',
            // Blokování pouze overlay a login dialogu
            'div[role="presentation"]',
            'div[role="dialog"]',
            'div.__fb-light-mode',
            'div.__fb-dark-mode'
        ],
        
        // CSS pro skrytí elementů
        hideCSS: `
            .fb-login-blocked {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
            }
            
            .fb-login-blocked * {
                display: none !important;
            }
        `
    };

    // Přidání CSS do stránky
    function injectCSS() {
        const style = document.createElement('style');
        style.id = 'fb-login-blocker-css';
        style.textContent = config.hideCSS;
        document.head.appendChild(style);
    }

    // Obnova stylů na <body> a <html> po odstranění overlaye
    function restoreBodyStyles() {
        const body = document.body;
        const html = document.documentElement;
        if (body) {
            body.style.overflow = '';
            body.style.position = '';
            body.style.pointerEvents = '';
            body.style.height = '';
            body.style.width = '';
            // Odstraňte případné třídy, které blokují interakci
            body.classList.remove('no_scroll', 'fb_hidden', 'fb_dialog', 'ui_overlay', 'modal_open');
        }
        if (html) {
            html.style.overflow = '';
            html.style.position = '';
            html.style.pointerEvents = '';
            html.style.height = '';
            html.style.width = '';
        }
    }

    // Blokování elementů
    function blockElements() {
        if (!config.enabled) return;

        // Projděte všechny dialogy a overlaye
        document.querySelectorAll('div[role="dialog"], div.__fb-light-mode, div.__fb-dark-mode').forEach(element => {
            // Blokujte pouze pokud obsahuje login formulář nebo pole pro email/heslo
            if (
                element.querySelector('input[name="email"]') ||
                element.querySelector('input[name="pass"]') ||
                element.querySelector('form[action*="login"]') ||
                element.textContent.match(/Přihlásit|Log In|Přihlásit se/i)
            ) {
                if (!element.classList.contains('fb-login-blocked')) {
                    element.classList.add('fb-login-blocked');
                    // Přidání event listenerů pro zabránění interakci
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }, true);
                    element.addEventListener('submit', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }, true);
                    element.addEventListener('keydown', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }, true);
                }
            }
        });

        // Ostatní selektory (formuláře, tlačítka, pole) blokujte jako dříve
        config.selectors.forEach(selector => {
            if (
                selector === 'div[role="dialog"]' ||
                selector === 'div.__fb-light-mode' ||
                selector === 'div.__fb-dark-mode'
            ) return; // už řešeno výše

            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.classList.contains('fb-login-blocked')) {
                    element.classList.add('fb-login-blocked');
                    // Přidání event listenerů pro zabránění interakci
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }, true);
                    element.addEventListener('submit', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }, true);
                    element.addEventListener('keydown', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }, true);
                }
            });
        });

        // Po odstranění overlaye obnovit styly
        restoreBodyStyles();
    }

    // Sledování změn v DOM
    function observeDOM() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    blockElements();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Inicializace
    function init() {
        // Načtení nastavení z storage
        chrome.storage.sync.get(['enabled'], function(result) {
            config.enabled = result.enabled !== undefined ? result.enabled : true;
            
            // Přidání CSS
            injectCSS();
            
            // Blokování existujících elementů
            blockElements();
            
            // Sledování nových elementů
            observeDOM();
            
            // Pravidelné kontrolování (pro případ, že observer selže)
            setInterval(blockElements, 2000);
        });
    }

    // Počítadlo blokovaných elementů
    let blockedElementsCount = 0;

    // Poslouchání zpráv z popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'toggle') {
            config.enabled = request.enabled;
            if (config.enabled) {
                blockElements();
            } else {
                // Odstranění blokování
                document.querySelectorAll('.fb-login-blocked').forEach(element => {
                    element.classList.remove('fb-login-blocked');
                });
                blockedElementsCount = 0;
            }
            sendResponse({success: true});
        } else if (request.action === 'getStats') {
            // Počítání aktuálně blokovaných elementů
            blockedElementsCount = document.querySelectorAll('.fb-login-blocked').length;
            sendResponse({
                blockedCount: blockedElementsCount,
                success: true
            });
        }
    });

    // Spuštění po načtení DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Záloha pro případ, že DOMContentLoaded už proběhl
    if (document.body) {
        init();
    }

})(); 