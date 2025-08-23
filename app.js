class URLListApp {
    constructor() {
        this.currentList = {
            title: '',
            items: [],
            id: this.generateId()
        };
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromURL();
        this.updateView();
    }

    bindEvents() {
        // Navigation
        document.getElementById('create-list-btn').addEventListener('click', () => this.createNewList());
        document.getElementById('back-btn').addEventListener('click', () => this.goHome());
        
        // List management
        document.getElementById('list-title').addEventListener('input', (e) => this.updateTitle(e.target.value));
        document.getElementById('list-title').addEventListener('blur', () => this.saveToURL());
        
        // Item management
        document.getElementById('add-item-btn').addEventListener('click', () => this.addItem());
        document.getElementById('new-item-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        
        // Sharing
        document.getElementById('share-btn').addEventListener('click', () => this.shareList());
        
        // Warning banner
        document.getElementById('dismiss-warning').addEventListener('click', () => this.dismissWarning());
        document.getElementById('bookmark-reminder').addEventListener('click', () => this.promptBookmark());
        
        // Handle URL changes (back/forward)
        window.addEventListener('popstate', () => {
            this.loadFromURL();
            this.updateView();
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createNewList() {
        this.currentList = {
            title: '',
            items: [],
            id: this.generateId()
        };
        this.currentPage = 'list';
        this.saveToURL();
        this.updateView();
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('list-title').focus();
        }, 100);
    }

    goHome() {
        this.currentPage = 'home';
        // Clear URL hash
        history.pushState(null, null, window.location.pathname);
        this.updateView();
    }

    updateTitle(title) {
        this.currentList.title = title;
        this.updateStats();
    }

    addItem() {
        const input = document.getElementById('new-item-input');
        const text = input.value.trim();
        
        if (!text) return;

        // Check capacity limits
        if (this.currentList.items.length >= 25) {
            this.showToast('Maximum of 25 items reached', 'warning');
            return;
        }

        const item = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: Date.now()
        };

        this.currentList.items.unshift(item);
        input.value = '';
        
        this.saveToURL();
        this.renderItems();
        this.updateStats();
        this.showToast('Item added!', 'success');
    }

    toggleItem(itemId) {
        const item = this.currentList.items.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            this.saveToURL();
            this.renderItems();
            this.updateStats();
            this.showToast(item.completed ? 'Item completed!' : 'Item unchecked', 'info');
        }
    }

    editItem(itemId, newText) {
        const item = this.currentList.items.find(item => item.id === itemId);
        if (item && newText.trim()) {
            item.text = newText.trim();
            this.saveToURL();
            this.showToast('Item updated!', 'success');
        }
    }

    deleteItem(itemId) {
        this.currentList.items = this.currentList.items.filter(item => item.id !== itemId);
        this.saveToURL();
        this.renderItems();
        this.updateStats();
        this.showToast('Item deleted', 'info');
    }

    saveToURL() {
        if (this.currentPage === 'list') {
            const data = {
                v: 1, // version
                t: this.currentList.title,
                i: this.currentList.items.map(item => ({
                    id: item.id,
                    t: item.text,
                    c: item.completed,
                    ca: item.createdAt
                }))
            };
            
            try {
                const compressed = this.compressData(JSON.stringify(data));
                const hash = `#data=${compressed}`;
                history.replaceState(null, null, hash);
            } catch (error) {
                console.error('Failed to save data:', error);
                this.showToast('Error saving list data', 'warning');
            }
        }
    }

    loadFromURL() {
        const hash = window.location.hash;
        
        if (!hash.startsWith('#data=')) {
            this.currentPage = 'home';
            return;
        }

        try {
            const compressed = hash.substring(6); // Remove '#data='
            let jsonString;
            let data;
            
            console.log('Loading compressed data:', compressed.substring(0, 50) + '...');
            
            // Use simple base64 decompression
            jsonString = this.decompressData(compressed);
            console.log('Decompression result:', jsonString.substring(0, 100) + '...');
            data = JSON.parse(jsonString);
            
            this.currentList = {
                title: data.t || '',
                items: (data.i || []).map(item => ({
                    id: item.id,
                    text: item.t,
                    completed: item.c || false,
                    createdAt: item.ca || Date.now()
                })),
                id: this.generateId()
            };
            
            this.currentPage = 'list';
            console.log('List loaded successfully:', this.currentList.items.length, 'items');
        } catch (error) {
            console.error('Failed to load list data:', error);
            this.currentPage = 'home';
            this.showToast('Error loading list from link', 'error');
        }
    }

    // LZ-string implementation for better compression
    compressToBase64(input) {
        if (input == null) return "";
        const res = this._compress(input, 6, (a) => this.keyStrBase64.charAt(a));
        switch (res.length % 4) {
            default:
            case 0:
                return res;
            case 1:
                return res + "===";
            case 2:
                return res + "==";
            case 3:
                return res + "=";
        }
    }

    decompressFromBase64(input) {
        if (input == null) return "";
        if (input == "") return null;
        return this._decompress(input.length, 32, (index) => this.getBaseValue(this.keyStrBase64, input.charAt(index)));
    }

    _compress(uncompressed, bitsPerChar, getCharFromInt) {
        if (uncompressed == null) return "";
        
        let context_dictionary = {};
        let context_dictionaryToCreate = {};
        let context_c = "";
        let context_wc = "";
        let context_w = "";
        let context_enlargeIn = 2;
        let context_dictSize = 3;
        let context_numBits = 2;
        let context_data = [];
        let context_data_val = 0;
        let context_data_position = 0;
        
        for (let ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }

            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            } else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (let i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        let value = context_w.charCodeAt(0);
                        for (let i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        let value = 1;
                        for (let i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                        value = context_w.charCodeAt(0);
                        for (let i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    let value = context_dictionary[context_w];
                    for (let i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }

        if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (let i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                    }
                    let value = context_w.charCodeAt(0);
                    for (let i = 0; i < 8; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                } else {
                    let value = 1;
                    for (let i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                    value = context_w.charCodeAt(0);
                    for (let i = 0; i < 16; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            } else {
                let value = context_dictionary[context_w];
                for (let i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    } else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }

        let value = 2;
        for (let i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
            } else {
                context_data_position++;
            }
            value = value >> 1;
        }

        while (true) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            } else context_data_position++;
        }
        return context_data.join('');
    }

    _decompress(length, resetValue, getNextValue) {
        let dictionary = [];
        let enlargeIn = 4;
        let dictSize = 4;
        let numBits = 3;
        let entry = "";
        let result = [];
        let i;
        let w;
        let bits, resb, maxpower, power;
        let c;
        let data = {val: getNextValue(0), position: resetValue, index: 1};

        for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }

        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }

        switch (bits) {
            case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = String.fromCharCode(bits);
                break;
            case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = String.fromCharCode(bits);
                break;
            case 2:
                return "";
        }
        dictionary[3] = c;
        w = c;
        result.push(c);
        while (true) {
            if (data.index > length) {
                return "";
            }

            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }

            switch (c = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }

                    dictionary[dictSize] = String.fromCharCode(bits);
                    c = dictSize;
                    dictSize++;
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize] = String.fromCharCode(bits);
                    c = dictSize;
                    dictSize++;
                    break;
                case 2:
                    return result.join('');
            }

            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }

            if (dictionary[c]) {
                entry = dictionary[c];
            } else {
                if (c === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }
            result.push(entry);

            dictionary[dictSize] = w + entry.charAt(0);
            dictSize++;

            w = entry;

            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
        }
    }

    keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    
    getBaseValue(alphabet, character) {
        if (!this.baseReverseDic) this.baseReverseDic = {};
        if (!this.baseReverseDic[alphabet]) {
            this.baseReverseDic[alphabet] = {};
            for (let i = 0; i < alphabet.length; i++) {
                this.baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return this.baseReverseDic[alphabet][character];
    }

    compressData(data) {
        // Use simple base64 encoding for now - reliable and works
        return btoa(encodeURIComponent(data));
    }

    decompressData(compressed) {
        return decodeURIComponent(atob(compressed));
    }

    shareList() {
        const url = window.location.href;
        
        if (navigator.share && this.isMobile()) {
            navigator.share({
                title: this.currentList.title || 'My List',
                url: url
            }).catch(() => {
                this.copyToClipboard(url);
            });
        } else {
            this.copyToClipboard(url);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Link copied to clipboard!', 'success');
        });
    }

    isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    updateView() {
        // Show/hide pages
        document.getElementById('home-page').classList.toggle('active', this.currentPage === 'home');
        document.getElementById('list-page').classList.toggle('active', this.currentPage === 'list');
        
        if (this.currentPage === 'list') {
            document.getElementById('list-title').value = this.currentList.title;
            this.renderItems();
            this.updateStats();
            this.checkWarningDismissal();
        }
    }

    renderItems() {
        const container = document.getElementById('list-items');
        
        if (this.currentList.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>No items yet. Add your first item above!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentList.items.map(item => `
            <div class="list-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                <button class="item-checkbox" onclick="app.toggleItem('${item.id}')" title="${item.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                </button>
                <div class="item-content">
                    <input type="text" class="item-text" value="${this.escapeHtml(item.text)}" 
                           onblur="app.editItem('${item.id}', this.value)"
                           onkeypress="if(event.key==='Enter') this.blur()"
                           maxlength="500">
                </div>
                <button class="item-delete" onclick="app.deleteItem('${item.id}')" title="Delete item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.currentList.items.length;
        const completed = this.currentList.items.filter(item => item.completed).length;
        
        document.getElementById('items-count').textContent = `${total} item${total !== 1 ? 's' : ''}`;
        document.getElementById('completed-count').textContent = `${completed} completed`;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    dismissWarning() {
        const banner = document.getElementById('warning-banner');
        banner.classList.add('dismissed');
        
        // Save dismissal state for this session
        sessionStorage.setItem('warning-dismissed', 'true');
        this.showToast('Remember to bookmark this page!', 'info');
    }

    promptBookmark() {
        // Copy the URL instead of showing bookmark instructions
        this.copyToClipboard(window.location.href);
    }

    checkWarningDismissal() {
        const dismissed = sessionStorage.getItem('warning-dismissed');
        if (dismissed) {
            document.getElementById('warning-banner').classList.add('dismissed');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const app = new URLListApp();