// Popup JavaScript pro Facebook Login Blocker
document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const toggleSwitch = document.getElementById('toggleSwitch');
    const toggleLabel = document.getElementById('toggleLabel');
    const blockedCount = document.getElementById('blockedCount');
    const lastUpdate = document.getElementById('lastUpdate');
    const refreshBtn = document.getElementById('refreshBtn');
    const resetBtn = document.getElementById('resetBtn');

    let isEnabled = true;

    // Načtení stavu z storage
    function loadState() {
        chrome.storage.sync.get(['enabled', 'blockedCount', 'lastUpdate'], function(result) {
            isEnabled = result.enabled !== undefined ? result.enabled : true;
            updateUI();
            
            if (result.blockedCount !== undefined) {
                blockedCount.textContent = result.blockedCount;
            }
            
            if (result.lastUpdate !== undefined) {
                lastUpdate.textContent = formatTime(result.lastUpdate);
            }
        });
    }

    // Aktualizace UI
    function updateUI() {
        if (isEnabled) {
            statusIndicator.className = 'status-indicator active';
            statusText.textContent = 'Blokování aktivní';
            toggleSwitch.classList.add('active');
            toggleLabel.textContent = 'Blokování aktivní';
        } else {
            statusIndicator.className = 'status-indicator inactive';
            statusText.textContent = 'Blokování neaktivní';
            toggleSwitch.classList.remove('active');
            toggleLabel.textContent = 'Blokování neaktivní';
        }
    }

    // Přepnutí stavu
    function toggleState() {
        isEnabled = !isEnabled;
        
        // Uložení do storage
        chrome.storage.sync.set({enabled: isEnabled});
        
        // Aktualizace UI
        updateUI();
        
        // Odeslání zprávy do content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && (tabs[0].url.includes('facebook.com') || tabs[0].url.includes('fb.com'))) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggle',
                    enabled: isEnabled
                }, function(response) {
                    if (response && response.success) {
                        console.log('Stav rozšíření aktualizován');
                    }
                });
            }
        });
    }

    // Získání statistik z content script
    function getStats() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && (tabs[0].url.includes('facebook.com') || tabs[0].url.includes('fb.com'))) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'getStats'
                }, function(response) {
                    if (response && response.blockedCount !== undefined) {
                        blockedCount.textContent = response.blockedCount;
                        lastUpdate.textContent = formatTime(Date.now());
                        
                        // Uložení statistik
                        chrome.storage.sync.set({
                            blockedCount: response.blockedCount,
                            lastUpdate: Date.now()
                        });
                    }
                });
            }
        });
    }

    // Resetování statistik
    function resetStats() {
        blockedCount.textContent = '0';
        lastUpdate.textContent = '-';
        
        chrome.storage.sync.set({
            blockedCount: 0,
            lastUpdate: null
        });
    }

    // Formátování času
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // méně než 1 minuta
            return 'Právě teď';
        } else if (diff < 3600000) { // méně než 1 hodina
            const minutes = Math.floor(diff / 60000);
            return `před ${minutes} min`;
        } else if (diff < 86400000) { // méně než 1 den
            const hours = Math.floor(diff / 3600000);
            return `před ${hours} h`;
        } else {
            return date.toLocaleDateString('cs-CZ');
        }
    }

    // Event listeners
    toggleSwitch.addEventListener('click', toggleState);
    
    refreshBtn.addEventListener('click', function() {
        getStats();
        refreshBtn.textContent = '⏳';
        setTimeout(() => {
            refreshBtn.textContent = '🔄 Obnovit';
        }, 1000);
    });
    
    resetBtn.addEventListener('click', function() {
        if (confirm('Opravdu chcete resetovat statistiky?')) {
            resetStats();
            resetBtn.textContent = '✓';
            setTimeout(() => {
                resetBtn.textContent = '🔄 Resetovat';
            }, 1000);
        }
    });

    // Načtení počátečního stavu
    loadState();
    
    // Automatické obnovení statistik při otevření popup
    setTimeout(getStats, 500);
}); 