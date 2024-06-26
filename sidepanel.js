console.log('Side panel script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Side panel DOM loaded');
    loadItems();

    // 添加後台管理按鈕的點擊事件
    document.getElementById('open-admin').addEventListener('click', function() {
        chrome.tabs.create({url: 'admin.html'});
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Side panel received message:", request);
    if (request.action === "updateSidepanel") {
        console.log('Updating side panel');
        if (request.newItem) {
            addNewItem(request.newItem);
        } else {
            loadItems();
        }
    }
});

function loadItems() {
    console.log('開始加載項目');
    chrome.storage.sync.get(null, function(items) {
        console.log('檢索到的項目:', items);
        updateItemsDisplay(items);
    });
}

function updateItemsDisplay(items) {
    let container = document.getElementById('items-container');
    if (!container) {
        console.error('找不到 items-container 元素');
        return;
    }
    container.innerHTML = '';
    let itemsArray = Object.entries(items).sort((a, b) => b[0] - a[0]);
    for (let [key, item] of itemsArray) {
        console.log('處理項目:', key, item);
        let itemElement = createItemElement(key, item);
        container.appendChild(itemElement);
    }
    if (itemsArray.length === 0) {
        console.log('沒有找到項目');
        container.innerHTML = '<p>還沒有儲存的內容</p>';
    }
}

function addNewItem(item) {
    console.log('Adding new item:', item);
    chrome.storage.sync.get(null, function(items) {
        items[item.timestamp] = item;
        updateItemsDisplay(items);
    });
}

function createItemElement(key, item) {
    console.log('創建項目元素:', key, item);
    let div = document.createElement('div');
    div.className = 'item';
    div.dataset.key = key;
    div.innerHTML = `
        <button class="delete-btn">刪除</button>
        <h3>${item.type}</h3>
        <div class="item-content">${formatContent(item)}</div>
        <div class="item-timestamp">${new Date(parseInt(key)).toLocaleString()}</div>
    `;

    div.querySelector('.delete-btn').addEventListener('click', function() {
        deleteItem(key);
    });

    return div;
}

function formatContent(item) {
    switch(item.type) {
        case 'text':
            return item.content;
        case 'image':
        case 'screenshot':
            return `<img src="${item.content}" style="max-width:100%; cursor: pointer;" onclick="window.open('${item.content}', '_blank')">`;
        default:
            return '未知類型內容';
    }
}

function deleteItem(key) {
    console.log('刪除項目:', key);
    chrome.storage.sync.remove(key, function() {
        if (chrome.runtime.lastError) {
            console.error('刪除項目時發生錯誤:', chrome.runtime.lastError);
        } else {
            console.log('項目已刪除:', key);
            // 直接從 DOM 中移除元素，而不是重新加載所有項目
            let itemToRemove = document.querySelector(`.item[data-key="${key}"]`);
            if (itemToRemove) {
                itemToRemove.remove();
            }
            // 檢查是否所有項目都被刪除
            if (document.querySelectorAll('.item').length === 0) {
                document.getElementById('items-container').innerHTML = '<p>還沒有儲存的內容</p>';
            }
        }
    });
}

console.log('Side panel script execution completed');
