import ClipboardJS from 'clipboard';

/**
 * @description: 文件下载到本地
 * @param buffer {Uint8Array[]} - 文件数据
 * @param fileName {string} - 文件名
 */
export const saveFileToLocal = (buffer: Uint8Array[], fileName: string) => {
    // 合并文件数据
    const fullFile = new Blob(buffer);

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(fullFile);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.click();

    // 清理
    URL.revokeObjectURL(downloadUrl);
};

/**
 * @description: 复制文本到剪贴板
 * @param text {string} - 要复制的文本
 * @returns {Promise<boolean>} - 返回是否复制成功
 */
export const copyToClipboard = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // 创建一个临时的按钮元素
    const button = document.createElement('button');
    button.style.display = 'none';
    document.body.appendChild(button);

    // 初始化 clipboard.js
    const clipboard = new ClipboardJS(button, {
      text: () => text
    });

    // 监听成功事件
    clipboard.on('success', () => {
      clipboard.destroy();
      document.body.removeChild(button);
      resolve(true);
    });

    // 监听错误事件
    clipboard.on('error', () => {
      clipboard.destroy();
      document.body.removeChild(button);
      resolve(false);
    });

    // 触发点击
    button.click();
  });
}; 
