const GEMINI_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY)
  || (typeof window !== 'undefined' && window.__GEMINI_API_KEY__)
  || 'AIzaSyAOQEI0I8fUGCUN_kV0wetCfU01YxBFkZY';
// Use a supported model endpoint
const GEMINI_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_URL)
  || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class GeminiApiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.baseUrl = GEMINI_API_URL;
  }

  async generateResponse(prompt, context = '') {
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      
      console.log('Calling Gemini API with prompt:', fullPrompt.substring(0, 100) + '...');
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  // API للشكاوى
  async handleComplaint(complaintData) {
    const prompt = `
      أنت مساعد ذكي متخصص في حل المشاكل والشكاوى التعليمية.
      
      بيانات الشكوى:
      - النوع: ${complaintData.type}
      - الوصف: ${complaintData.description}
      - التاريخ: ${complaintData.date}
      
      يرجى تقديم:
      1. تحليل للمشكلة
      2. حلول مقترحة
      3. نصائح للوقاية من المشكلة مستقبلاً
      4. خطوات عملية لحل المشكلة
      
      أجب باللغة العربية إذا كانت الشكوى بالعربية، وبالإنجليزية إذا كانت بالإنجليزية.
    `;

    try {
      const response = await this.generateResponse(prompt);
      return {
        success: true,
        analysis: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackComplaintResponse(complaintData)
      };
    }
  }

  // API للدردشة
  async handleChatMessage(message, chatHistory = []) {
    const context = chatHistory.length > 0 
      ? `تاريخ المحادثة السابق:\n${chatHistory.slice(-5).map(msg => `${msg.sender}: ${msg.text}`).join('\n')}`
      : '';

    const prompt = `
      أنت مساعد ذكي ودود متخصص في المساعدة التعليمية والأكاديمية.
      
      ${context}
      
      رسالة المستخدم الحالية: "${message}"
      
      يرجى الرد بطريقة:
      1. مفيدة ومفصلة
      2. ودية ومشجعة
      3. تتضمن أمثلة عملية إذا كان ذلك مناسباً
      4. تقدم خطوات واضحة إذا كان السؤال يتطلب ذلك
      
      أجب باللغة العربية إذا كانت الرسالة بالعربية، وبالإنجليزية إذا كانت بالإنجليزية.
    `;

    try {
      const response = await this.generateResponse(prompt, context);
      return {
        success: true,
        response: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackChatResponse(message)
      };
    }
  }

  // API للتقارير
  async generateReport(reportData) {
    const prompt = `
      أنت محلل تعليمي متخصص في إنشاء تقارير مفصلة ومفيدة.
      
      بيانات التقرير:
      - النوع: ${reportData.type}
      - الفترة: ${reportData.period}
      - البيانات المتاحة: ${reportData.data}
      
      يرجى إنشاء تقرير يتضمن:
      1. ملخص تنفيذي
      2. تحليل البيانات
      3. النقاط الرئيسية
      4. التوصيات
      5. خطوات العمل المقترحة
      
      أجب باللغة العربية إذا كانت البيانات بالعربية، وبالإنجليزية إذا كانت بالإنجليزية.
    `;

    try {
      const response = await this.generateResponse(prompt);
      return {
        success: true,
        report: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackReportResponse(reportData)
      };
    }
  }

  // ردود احتياطية في حالة فشل API
  getFallbackComplaintResponse(complaintData) {
    const isArabic = complaintData.description && /[\u0600-\u06FF]/.test(complaintData.description);
    
    if (isArabic) {
      return `شكراً لك على إرسال شكواك. بناءً على وصفك، يبدو أن لديك مشكلة تحتاج إلى اهتمام. سأقوم بتحليلها وتقديم حلول مفيدة لك. رقم الشكوى: ${complaintData.complaintsNo || 'قيد المعالجة'}`;
    } else {
      return `Thank you for submitting your complaint. Based on your description, it seems you have an issue that needs attention. I will analyze it and provide helpful solutions. Complaint number: ${complaintData.complaintsNo || 'Processing'}`;
    }
  }

  getFallbackChatResponse(message) {
    const isArabic = message && /[\u0600-\u06FF]/.test(message);
    
    if (isArabic) {
      return 'مرحباً! شكراً لك على رسالتك. أنا مساعد ذكي متخصص في المساعدة التعليمية. كيف يمكنني مساعدتك اليوم؟';
    } else {
      return 'Hello! Thank you for your message. I am an AI assistant specialized in educational help. How can I assist you today?';
    }
  }

  getFallbackReportResponse(reportData) {
    const isArabic = reportData.type && /[\u0600-\u06FF]/.test(reportData.type);
    
    if (isArabic) {
      return `سيتم إنشاء التقرير المطلوب (${reportData.type}) في أقرب وقت ممكن. سنقوم بإشعارك عند الانتهاء.`;
    } else {
      return `The requested report (${reportData.type}) will be generated as soon as possible. We will notify you when it's ready.`;
    }
  }

  // تحليل المشاعر في الرسائل
  async analyzeSentiment(text) {
    const prompt = `
      قم بتحليل مشاعر النص التالي وتصنيفه إلى:
      - إيجابي (positive)
      - سلبي (negative) 
      - محايد (neutral)
      
      النص: "${text}"
      
      أجب فقط بالتصنيف المطلوب.
    `;

    try {
      const response = await this.generateResponse(prompt);
      return {
        success: true,
        sentiment: response.trim().toLowerCase(),
        confidence: 0.8
      };
    } catch (error) {
      return {
        success: false,
        sentiment: 'neutral',
        confidence: 0.5
      };
    }
  }

  // اقتراح حلول للمشاكل
  async suggestSolutions(problem) {
    const prompt = `
      اقترح 3-5 حلول عملية للمشكلة التالية:
      
      المشكلة: "${problem}"
      
      لكل حل:
      1. وصف الحل
      2. خطوات التنفيذ
      3. الوقت المتوقع
      4. الموارد المطلوبة
      
      أجب باللغة العربية إذا كانت المشكلة بالعربية، وبالإنجليزية إذا كانت بالإنجليزية.
    `;

    try {
      const response = await this.generateResponse(prompt);
      return {
        success: true,
        solutions: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackResponse: 'سنقوم بمراجعة مشكلتك وتقديم حلول مناسبة في أقرب وقت ممكن.'
      };
    }
  }
}

// إنشاء نسخة واحدة من الخدمة
const geminiApiService = new GeminiApiService();

export default geminiApiService; 