# NutriDecode

NutriDecode is an advanced food analysis application that helps users understand their food choices better through AI-powered ingredient analysis, personalized recommendations, and voice interaction features.

## 🌟 Features

- **Smart Ingredient Analysis**: Upload food product images for detailed ingredient analysis
- **Voice Interaction**: Natural language voice chat for food-related queries
- **Text-to-Speech**: Listen to ingredient analysis and recommendations
- **Personalized Recommendations**: Get tailored food suggestions based on your preferences
- **User Profiles**: Save your dietary preferences and restrictions
- **History Tracking**: Keep track of your previous food analyses
- **Responsive Design**: Seamless experience across all devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Supabase account
- ElevenLabs API key
- OpenAI API key (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Decoding-DataScience/NutriDecodeDDS.git
cd NutriDecodeDDS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your API keys and configuration values:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Voice Features**: ElevenLabs API
- **Build Tool**: Vite
- **Deployment**: Vercel
- **State Management**: React Context
- **Authentication**: Supabase Auth

## 📁 Project Structure

```
nutridecode/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API and service integrations
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Helper functions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── supabase/          # Supabase configurations
└── package.json       # Project dependencies
```

## 🔑 Key Components

- **Auth**: User authentication and registration
- **Dashboard**: Main user interface for food analysis
- **Scan**: Image upload and processing
- **Results**: Detailed analysis display
- **VoiceChat**: Voice interaction interface
- **Settings**: User preferences management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Project Lead: Syed Hasan
- Development Team: Syed Hasan
- UI/UX Design: Syed Hasan

## 📞 Support +971 56 162 3670

For support, email [syed.hasan@nutridecode.ai]