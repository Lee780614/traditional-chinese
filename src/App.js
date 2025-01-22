import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gridSize, setGridSize] = useState(80); // 田字格大小

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setIsProcessing(true);
      
      try {
        const result = await Tesseract.recognize(
          file,
          'chi_tra',
          {
            logger: info => {
              console.log(info);
            }
          }
        );
        setRecognizedText(result.data.text);
      } catch (error) {
        console.error('识别错误:', error);
        setRecognizedText('识别出错，请重试');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const generateWorksheet = () => {
    if (!recognizedText) return;

    // 创建临时容器
    const container = document.createElement('div');
    container.style.width = '210mm'; // A4 宽度
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';

    // 分割文字并过滤空格
    const characters = recognizedText.split('').filter(char => char.trim());

    // 为每个字符创建田字格
    characters.forEach(char => {
      const grid = document.createElement('div');
      grid.style.width = `${gridSize}px`;
      grid.style.height = `${gridSize}px`;
      grid.style.border = '1px solid #ccc';
      grid.style.display = 'inline-flex';
      grid.style.justifyContent = 'center';
      grid.style.alignItems = 'center';
      grid.style.margin = '5px';
      grid.style.position = 'relative';

      // 添加米字格辅助线
      const lines = [
        'top: 50%; left: 0; right: 0;',
        'left: 50%; top: 0; bottom: 0;',
        'top: 0; left: 0; right: 0;',
        'top: 0; left: 0; bottom: 0;',
        'transform: rotate(45deg);',
        'transform: rotate(-45deg);'
      ];

      lines.forEach(style => {
        const line = document.createElement('div');
        line.style.cssText = `
          position: absolute;
          border-top: 1px dashed #ddd;
          ${style}
        `;
        grid.appendChild(line);
      });

      // 添加字符
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.style.fontSize = '24px';
      charSpan.style.color = '#999';
      grid.appendChild(charSpan);

      container.appendChild(grid);
    });

    // 临时添加到文档中
    document.body.appendChild(container);

    // 转换为PDF
    html2canvas(container).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save('练字帖.pdf');
      document.body.removeChild(container);
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>繁体字练字帖生成器</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleImageUpload}
          accept="image/*"
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      {selectedImage && (
        <div style={{ marginBottom: '20px' }}>
          <img 
            src={selectedImage} 
            alt="Selected" 
            style={{ maxWidth: '100%', borderRadius: '4px' }}
          />
        </div>
      )}
      
      {isProcessing && (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          正在识别文字，请稍候...
        </div>
      )}
      
      {recognizedText && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ marginBottom: '10px' }}>识别结果：</h2>
          <textarea
            value={recognizedText}
            onChange={(e) => setRecognizedText(e.target.value)}
            style={{ 
              width: '100%', 
              height: '200px', 
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>
              田字格大小：
              <input
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                style={{ width: '60px', marginLeft: '5px' }}
                min="40"
                max="120"
              />
            </label>
          </div>
          <button
            onClick={generateWorksheet}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            生成练字帖
          </button>
        </div>
      )}
    </div>
  );
}

export default App;