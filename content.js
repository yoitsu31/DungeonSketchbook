chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content.js 收到消息:", request);
  if (request.action === "saveText") {
    const text = request.text || window.getSelection().toString();
    saveItem('text', text);
  } else if (request.action === "saveImage") {
    saveItem('image', request.srcUrl);
  }
});

function saveItem(type, content) {
  const item = {
    type: type,
    content: content,
    timestamp: Date.now()
  };
  console.log("content.js 準備儲存項目:", item);
  chrome.storage.sync.set({ [item.timestamp]: item }, () => {
    if (chrome.runtime.lastError) {
      console.error("儲存時發生錯誤:", chrome.runtime.lastError);
    } else {
      console.log('content.js 內容已保存:', item);
      chrome.runtime.sendMessage({action: "updateSidepanel", newItem: item});
    }
  });
}
