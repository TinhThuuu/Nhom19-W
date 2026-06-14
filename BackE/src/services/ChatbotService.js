const { GoogleGenerativeAI } = require("@google/generative-ai");
const ProductModel = require("../models/ProductModel");
const ChatHistoryModel = require("../models/ChatHistoryModel");

class ChatbotService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async getProducts() {
        try {
            const products = await ProductModel.find({});
            return products;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    }

    async getOrCreateHistory(userId, sessionId) {
        let historyDoc = null;
        if (userId) {
            historyDoc = await ChatHistoryModel.findOne({ userId });
            if (!historyDoc && sessionId) {
                historyDoc = await ChatHistoryModel.findOne({ sessionId, userId: null });
                if (historyDoc) {
                    historyDoc.userId = userId;
                    await historyDoc.save();
                }
            }
        } else if (sessionId) {
            historyDoc = await ChatHistoryModel.findOne({ sessionId, userId: null });
        }

        if (!historyDoc) {
            historyDoc = new ChatHistoryModel({
                userId: userId || null,
                sessionId: sessionId || `session_${Date.now()}`,
                messages: []
            });
        }
        return historyDoc;
    }

    async generateResponse(userMessage, userId = null, sessionId = null) {
        const historyDoc = await this.getOrCreateHistory(userId, sessionId);

        try {
            const products = await this.getProducts();

            const limitedProducts = products.slice(0, 50);
            const productContext = limitedProducts.map(product => {
                return `Tên sản phẩm: ${product.name}
Giá: ${product.price.toLocaleString('vi-VN')} VNĐ
Mô tả: ${product.description || 'Không có mô tả'}
Loại: ${product.type}
Số lượng kho: ${product.countInStock}
Đánh giá: ${product.rating}/5 (${product.numReviews} lượt)`;
            }).join('\n\n');

            const systemPrompt = `Bạn là chuyên gia tư vấn bán hàng điện thoại di động thông minh của cửa hàng DT-Shop.
Bạn chỉ được phép giới thiệu và so sánh các sản phẩm điện thoại di động thực tế có trong danh sách dữ liệu được cung cấp dưới đây.
Hãy luôn trả lời thân thiện, nhiệt tình, chuyên nghiệp bằng tiếng Việt tự nhiên, sử dụng định dạng markdown rõ ràng, thêm emoji phù hợp.
Khi so sánh, hãy chỉ rõ các điểm khác biệt về giá bán, RAM, bộ nhớ trong, camera, dung lượng pin dựa theo mô tả sản phẩm.

Danh sách sản phẩm hiện có trong kho hàng DT-Shop:
${productContext}

QUY TẮC QUAN TRỌNG:
1. Nếu khách hàng hỏi về các sản phẩm KHÔNG CÓ trong danh sách trên, hãy trả lời lịch sự rằng dòng máy đó hiện tại cửa hàng chưa có hàng, và chủ động giới thiệu 1-2 sản phẩm tương đương có sẵn trong danh sách.
2. Tránh bịa đặt hoặc tự nghĩ ra thông tin thông số kỹ thuật hay giá bán không đúng với danh sách được cung cấp.`;

            const chatHistory = historyDoc.messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt
            });

            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.7,
                },
            });

            const result = await chat.sendMessage(userMessage);
            const aiResponseText = result.response.text();

            historyDoc.messages.push({ role: 'user', content: userMessage });
            historyDoc.messages.push({ role: 'model', content: aiResponseText });
            await historyDoc.save();

            return aiResponseText;
        } catch (error) {
            console.error("Error generating chatbot response, falling back:", error);
            return await this.getFallbackResponse(userMessage, historyDoc);
        }
    }

    async getFallbackResponse(userMessage, historyDoc) {
        try {
            const lowerMsg = userMessage.toLowerCase().trim();

            if (lowerMsg.includes("bảo hành") || lowerMsg.includes("bao hanh") || lowerMsg.includes("đổi trả") || lowerMsg.includes("doi tra")) {
                const text = "📋 **Chính sách bảo hành & đổi trả tại DT-Shop:**\n\n- Bảo hành chính hãng **12 tháng** cho toàn bộ điện thoại mới.\n- Hỗ trợ **1 đổi 1** trong vòng 30 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất.\n- Khi bảo hành, quý khách vui lòng giữ lại hóa đơn mua hàng và đầy đủ phụ kiện đi kèm.";
                await this.saveToHistory(historyDoc, userMessage, text);
                return text;
            }

            if (lowerMsg.includes("thanh toán") || lowerMsg.includes("thanh toan") || lowerMsg.includes("vnpay") || lowerMsg.includes("cod")) {
                const text = "💳 **Phương thức thanh toán hỗ trợ:**\n\n- Thanh toán trực tuyến an toàn qua **Cổng VNPay** (QR Code, thẻ ATM nội địa, thẻ Visa/Mastercard).\n- Thanh toán trực tiếp bằng tiền mặt khi nhận hàng (**COD**).\n- Quý khách có thể lựa chọn phương thức thanh toán phù hợp tại bước thanh toán của giỏ hàng.";
                await this.saveToHistory(historyDoc, userMessage, text);
                return text;
            }

            if (lowerMsg.includes("vận chuyển") || lowerMsg.includes("ship") || lowerMsg.includes("giao hàng") || lowerMsg.includes("giao hang")) {
                const text = "🚚 **Chính sách vận chuyển và giao hàng:**\n\n- Miễn phí vận chuyển toàn quốc cho tất cả các đơn hàng điện thoại.\n- Thời gian giao hàng dự kiến:\n  * Nội thành TP.HCM: 1-2 ngày.\n  * Các tỉnh thành khác: Từ 3-5 ngày làm việc.\n- Quý khách được quyền mở hộp đồng kiểm sản phẩm trước khi thanh toán.";
                await this.saveToHistory(historyDoc, userMessage, text);
                return text;
            }

            const products = await this.getProducts();
            let matchedBrand = null;
            if (lowerMsg.includes("iphone") || lowerMsg.includes("apple")) matchedBrand = "iphone";
            else if (lowerMsg.includes("samsung")) matchedBrand = "samsung";
            else if (lowerMsg.includes("xiaomi")) matchedBrand = "xiaomi";
            else if (lowerMsg.includes("oppo")) matchedBrand = "oppo";
            else if (lowerMsg.includes("vivo")) matchedBrand = "vivo";

            let matchedPriceLimit = null;
            const priceRegex = /(\d+)\s*(triệu|trieu)/;
            const match = lowerMsg.match(priceRegex);
            if (match) {
                matchedPriceLimit = parseInt(match[1]) * 1000000;
            } else if (lowerMsg.includes("giá rẻ") || lowerMsg.includes("gia re")) {
                matchedPriceLimit = 5000000;
            }

            let filtered = products;
            if (matchedBrand) {
                filtered = filtered.filter(p => p.type.toLowerCase().includes(matchedBrand) || p.name.toLowerCase().includes(matchedBrand));
            }
            if (matchedPriceLimit) {
                filtered = filtered.filter(p => p.price <= matchedPriceLimit);
            }

            if (filtered.length > 0) {
                let intro = "🔍 **Gợi ý sản phẩm phù hợp tại cửa hàng:**\n\n";
                if (matchedBrand && matchedPriceLimit) {
                    intro = `🔍 **Điện thoại ${matchedBrand.toUpperCase()} dưới ${matchedPriceLimit.toLocaleString('vi-VN')} VNĐ đang có sẵn:**\n\n`;
                } else if (matchedBrand) {
                    intro = `🔍 **Điện thoại dòng ${matchedBrand.toUpperCase()} tại cửa hàng:**\n\n`;
                } else if (matchedPriceLimit) {
                    intro = `🔍 **Điện thoại có giá dưới ${matchedPriceLimit.toLocaleString('vi-VN')} VNĐ tốt nhất:**\n\n`;
                }

                const listText = filtered.slice(0, 3).map(p => {
                    return `- **${p.name}**\n  * Giá: **${p.price.toLocaleString('vi-VN')} VNĐ**\n  * Đánh giá: ⭐ ${p.rating}/5\n  * ${p.description || "Sản phẩm chất lượng cao."}`;
                }).join('\n\n');

                const text = intro + listText + "\n\n*(Lưu ý: Hệ thống AI đang tạm thời gián đoạn, kết quả này được tìm kiếm tự động từ danh mục)*";
                await this.saveToHistory(historyDoc, userMessage, text);
                return text;
            }

            const text = "🤖 **Trợ lý ảo DT-Shop xin lỗi:**\n\nHệ thống AI của chúng tôi hiện đang quá tải hoặc gặp lỗi kết nối. Quý khách vui lòng liên hệ trực tiếp hotline **1900-1234** hoặc inbox Zalo để nhận tư vấn trực tiếp 24/7 từ nhân viên cửa hàng nhé! Xin lỗi quý khách vì sự bất tiện này. 🙏";
            await this.saveToHistory(historyDoc, userMessage, text);
            return text;
        } catch (dbError) {
            console.error("Critical error in fallback response helper:", dbError);
            return "🤖 Hệ thống tư vấn của DT-Shop hiện tại đang gặp sự cố kỹ thuật. Mong quý khách thông cảm và thử lại sau hoặc liên hệ Hotline 1900-1234!";
        }
    }

    async saveToHistory(historyDoc, userMessage, aiResponse) {
        try {
            historyDoc.messages.push({ role: 'user', content: userMessage });
            historyDoc.messages.push({ role: 'model', content: aiResponse });
            await historyDoc.save();
        } catch (err) {
            console.error("Failed to save conversation history to MongoDB:", err);
        }
    }
}

module.exports = new ChatbotService();
