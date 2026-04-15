# Sponsored Jobs Analysis Engine - Supabase Edition

A comprehensive Next.js application for analyzing H1B visa sponsorship opportunities, powered by Supabase database.

## 🚀 Features

- **Live Database Integration**: Real-time data from Supabase PostgreSQL database
- **Comprehensive Analytics**: Overview, role analysis, company analysis, and top performers
- **Interactive Data Explorer**: Filter and search through job data with pagination
- **Modern UI**: Built with Next.js 15, React 18, TypeScript, and Tailwind CSS
- **Real-time Insights**: Dynamic charts and visualizations using Recharts

## 📊 Data Source

This application connects to a Supabase database containing:
- **402,573+ job records** from the `job_jobrole_sponsored` table
- **Complete dataset analysis** - loads all 402k+ records for comprehensive insights
- **Real-time data** with live database connection
- **Comprehensive job information** including company, role, location, and sponsorship status

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main page with navigation
├── components/
│   ├── Layout.tsx          # Main layout component
│   ├── Overview.tsx        # Database overview and statistics
│   ├── RoleAnalysis.tsx    # Job role analysis
│   ├── CompanyAnalysis.tsx # Company analysis
│   ├── TopPerformers.tsx   # Top performing companies/roles
│   └── DataExplorer.tsx    # Interactive data explorer
└── lib/
    ├── supabase.ts         # Supabase client configuration
    └── dataProcessor.ts    # Data processing utilities
```

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   DATABASE_URL=postgresql://postgres:password@host:port/database
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📈 Key Features

### Overview Dashboard
- Total job statistics
- Sponsored vs non-sponsored breakdown
- Top companies and job roles
- Real-time database connection status

### Role Analysis
- Search and filter job roles
- Sponsorship rate analysis
- Top companies for each role
- Location distribution

### Company Analysis
- Company-specific insights
- Job role distribution
- Sponsorship patterns
- Geographic presence

### Top Performers
- Companies with highest sponsorship rates
- Roles with best sponsorship opportunities
- Volume-based rankings
- Performance metrics

### Data Explorer
- Advanced filtering capabilities
- Paginated data browsing
- Real-time search
- Export-ready data views

## 🗄️ Database Schema

The application works with the `job_jobrole_sponsored` table containing:

- `id`: Primary key
- `company`: Company name
- `job_role_name`: Job role/title
- `location`: Job location
- `date_posted`: Posting date
- `sponsored_job`: Sponsorship status (Yes/No/Does not mention)
- `job_description`: Job description
- `requirements`: Job requirements
- `salary_range`: Salary information
- `experience_level`: Required experience
- `job_type`: Employment type
- `remote_work`: Remote work options
- `benefits`: Benefits information
- `application_deadline`: Application deadline
- `contact_email`: Contact information
- `website`: Company website
- `created_at`: Record creation timestamp

## 🔍 Usage

1. **Navigate** between different analysis views using the sidebar
2. **Search and filter** data in the Role Analysis and Company Analysis sections
3. **Explore** raw data in the Data Explorer with advanced filtering
4. **View** real-time statistics and insights across all sections

## 🚀 Performance

- **Complete dataset analysis** - loads all 402k+ records for comprehensive insights
- **Optimized queries** with proper indexing
- **Pagination** for large datasets in data explorer
- **Real-time updates** from Supabase
- **Efficient client-side processing** for analysis and filtering

## 📊 Complete Dataset Insights

- **Total Jobs**: 402,573+
- **Sponsored Jobs**: 3,429 (0.9%)
- **Non-Sponsored**: 4,255 (1.1%)
- **Does Not Mention**: 394,889 (98.1%)
- **Top Company**: Amazon (1,577 jobs)
- **Top Role**: Java Full Stack (12,436 jobs)

## 🔧 Development

- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **Responsive design** for all devices

## 📝 Notes

- The application loads the complete dataset (402k+ records) for comprehensive analysis
- All data is fetched in real-time from the Supabase database
- Initial loading may take 30-60 seconds due to the large dataset
- The connection status and data loading progress are displayed in the UI
- Error handling is implemented for network issues

## 🤝 Contributing - Not accepting()

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
