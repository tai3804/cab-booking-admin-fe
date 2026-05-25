import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Trash2, ArrowRight, BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào Quản trị viên! Tôi là **CAB AI Copilot** — trợ lý vận hành và giám sát hệ thống của bạn. Tôi có thể hỗ trợ gì cho bạn hôm nay?\n\nGợi ý: Bạn có thể yêu cầu tôi báo cáo doanh thu, phân tích các tuyến đường bị hủy nhiều, hoặc kiểm tra các chỉ số hệ thống.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const parseMarkdown = (text) => {
    if (!text) return '';
    // Escape HTML first
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Handle bullet points
    escaped = escaped.replace(/^\s*•\s*(.*)$/gm, '<li class="ml-4 list-disc my-1">$1</li>');
    escaped = escaped.replace(/^\s*-\s*(.*)$/gm, '<li class="ml-4 list-disc my-1">$1</li>');

    // Handle bold
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    
    // Handle inline code
    escaped = escaped.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-accent-primary font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">$1</code>');

    // Handle lines/paragraphs
    return escaped.split('\n').map((line, idx) => {
      if (line.trim().startsWith('<li')) return line;
      return `<p class="mb-2 leading-relaxed">${line}</p>`;
    }).join('');
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput('');

    const userMessageId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const response = await api.post('/api/v1/ai-agent/chat', { message: text });
      const reply = response.data?.reply || 'Tôi không nhận được phản hồi hợp lệ từ máy chủ.';
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: reply },
      ]);
    } catch (error) {
      console.error('Error sending message to AI Agent:', error);
      let errMsg = 'Xin lỗi, đã xảy ra lỗi trong quá trình kết nối với dịch vụ AI Agent. Vui lòng thử lại sau.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errMsg = '🔒 Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng trợ lý AI.';
        } else if (status === 403) {
          errMsg = '🔒 Quyền truy cập bị từ chối! Tài khoản của bạn không có đủ quyền quản trị để thực hiện yêu cầu này.';
        } else if (status === 429) {
          errMsg = '⚠️ Máy chủ AI đang nhận quá nhiều yêu cầu cùng lúc. Vui lòng thử lại sau vài giây.';
        } else if (status >= 500) {
          errMsg = '⚙️ Dịch vụ AI đang gặp sự cố kỹ thuật tạm thời. Vui lòng thử lại sau ít phút.';
        } else {
          errMsg = `⚙️ Lỗi phản hồi từ máy chủ (${status}): ${error.response.data?.message || error.message}`;
        }
      } else if (error.message === 'Network Error') {
        errMsg = `📡 Không thể kết nối với dịch vụ máy chủ (Network Error). Hãy đảm bảo máy chủ Gateway ở cổng 8080 đang chạy và CORS hợp lệ. Chi tiết lỗi: ${error.message}`;
      } else {
        errMsg = `⚠️ Lỗi xử lý giao diện: ${error.message}`;
      }
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'error', content: errMsg },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Tôi đã dọn sạch cuộc hội thoại. Hãy đặt câu hỏi mới cho tôi về hệ thống!',
      },
    ]);
  };

  const adminSuggestions = [
    {
      label: 'Báo cáo doanh thu & số cuốc hôm nay',
      icon: BarChart3,
      text: 'Hãy báo cáo doanh thu và số cuốc xe của hôm nay giúp tôi.',
    },
    {
      label: 'Phân tích các tuyến đường hủy cao',
      icon: AlertTriangle,
      text: 'Phân tích giúp tôi các tuyến đường và khung giờ đang bị hủy chuyến nhiều nhất gần đây.',
    },
    {
      label: 'Kiểm tra phân quyền hệ thống',
      icon: ShieldCheck,
      text: 'Kiểm tra phân quyền hệ thống hiện tại của tôi',
    },
  ];

  return (
    <>
      {/* Floating Sparkles Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99] flex items-center gap-2 px-4 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-accent hover:shadow-accent-hover transition-all duration-300 transform hover:scale-105 cursor-pointer animate-pulse-slow"
      >
        <Sparkles size={16} className="animate-spin-slow" />
        <span>AI Copilot</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-300"></span>
        </span>
      </button>

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer content container */}
        <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div
            className={`w-screen max-w-md transform bg-white border-l border-border-light shadow-card flex flex-col h-full transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-sky-50 to-white px-5 py-4 border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Bot size={18} className="text-sky-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                    CAB AI Copilot
                    <span className="px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-[10px] text-green-600 font-semibold uppercase tracking-wider animate-pulse">
                      Live
                    </span>
                  </h2>
                  <p className="text-[11px] text-text-muted">Trợ lý quản trị hệ thống Gemini</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Dọn sạch lịch sử"
                  className="p-2 rounded-lg text-text-secondary hover:bg-slate-100 hover:text-text-primary transition-all duration-200 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-text-secondary hover:bg-slate-100 hover:text-text-primary transition-all duration-200 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-text-muted mb-1 px-1">
                    {msg.role === 'user' ? 'BẠN' : 'AI COPILOT'}
                  </span>
                  
                  <div
                    className={`p-3.5 rounded-2xl text-[13px] shadow-inner-soft ${
                      msg.role === 'user'
                        ? 'bg-sky-500 text-white rounded-tr-sm'
                        : msg.role === 'error'
                        ? 'bg-red-50 text-red-900 border border-red-100 rounded-tl-sm'
                        : 'bg-white text-text-secondary border border-border-light rounded-tl-sm'
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: msg.role === 'user' ? parseMarkdown(msg.content) : parseMarkdown(msg.content),
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Pulsating Loader */}
              {isLoading && (
                <div className="flex flex-col items-start max-w-[85%]">
                  <span className="text-[10px] font-semibold text-text-muted mb-1 px-1">AI COPILOT ĐANG XỬ LÝ</span>
                  <div className="bg-white border border-border-light p-4 rounded-2xl rounded-tl-sm shadow-inner-soft flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Yêu cầu mẫu cho Quản trị viên
              </span>
              <div className="flex flex-col gap-1.5">
                {adminSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug.text)}
                    disabled={isLoading}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-100 hover:border-sky-200 bg-slate-50/50 hover:bg-sky-50/30 text-left text-xs font-semibold text-text-secondary hover:text-sky-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <sug.icon size={13} className="text-slate-400 group-hover:text-sky-600 flex-shrink-0" />
                    <span className="flex-1 truncate">{sug.label}</span>
                    <ArrowRight size={11} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Field */}
            <div className="p-4 bg-white border-t border-border-light flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Hỏi AI về doanh thu, tỷ lệ hủy, vận hành..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl text-sm focus:outline-none transition-all duration-200 disabled:opacity-50 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-accent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICopilot;
