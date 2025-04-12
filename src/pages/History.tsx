import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalysisHistory, deleteAnalysis, exportAnalysisData, type AnalysisFilters } from '../services/supabase';
import { 
  Clock, 
  Download, 
  Filter, 
  Trash2, 
  AlertTriangle, 
  X, 
  ChevronDown,
  SortAsc,
  SortDesc,
  Search,
  Calendar,
  Loader2
} from 'lucide-react';
import Header from '../components/Header';

interface FoodAnalysis {
  id: string;
  created_at: string;
  product_name: string;
  image_url: string;
  health_score: number;
  analysis_result: {
    productName: string;
    ingredients: {
      list: string[];
      preservatives: string[];
      additives: string[];
      antioxidants: string[];
      stabilizers: string[];
    };
    allergens: {
      declared: string[];
      mayContain: string[];
    };
    nutritionalInfo: any;
    healthScore: number;
    healthClaims: string[];
    packaging: {
      materials: string[];
      recyclingInfo: string;
      sustainabilityClaims: string[];
      certifications: string[];
    };
  };
}

const History = () => {
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [filters, setFilters] = useState<AnalysisFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const deletedIds = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await getAnalysisHistory(filters);
      
      // Remove duplicates and deleted items
      const uniqueHistory = history.reduce<FoodAnalysis[]>((acc, current) => {
        if (deletedIds.current.has(current.id)) {
          return acc;
        }

        const isDuplicate = acc.some(item => {
          if (item.product_name === current.product_name) {
            const timeDiff = Math.abs(
              new Date(item.created_at).getTime() - new Date(current.created_at).getTime()
            );
            return timeDiff < 60000; // 60000 milliseconds = 1 minute
          }
          return false;
        });
        
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []);

      setAnalyses(uniqueHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load analysis history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (analysis: FoodAnalysis) => {
    navigate('/results', { 
      state: { 
        analysis: analysis.analysis_result,
        imageUrl: analysis.image_url 
      } 
    });
  };

  const handleDelete = async (analysisId: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      // Optimistically remove from UI
      setAnalyses(prevAnalyses => prevAnalyses.filter(a => a.id !== analysisId));
      
      // Add to deleted IDs set
      deletedIds.current.add(analysisId);

      // Attempt deletion
      await deleteAnalysis(analysisId);
      
      // Clear error and confirmation on success
      setError(null);
      setDeleteConfirmation(null);

      // Refresh the list after successful deletion
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete analysis';
      
      // Show error message
      setError(`Failed to delete analysis: ${errorMessage}`);
      
      // If deletion failed, add to deleted IDs anyway to prevent showing
      deletedIds.current.add(analysisId);
      
      // Close the confirmation dialog
      setDeleteConfirmation(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setError(null);
      const data = await exportAnalysisData(format, filters);
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-history-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportOptions(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    }
  };

  const handleFilterChange = (updates: Partial<AnalysisFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Title and Actions */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
            <div className="flex items-center space-x-4">
              {/* Filter Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-100">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search Product
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by product name"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            value={filters.productName || ''}
                            onChange={(e) => handleFilterChange({ productName: e.target.value })}
                          />
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              className="w-full pl-10 pr-4 py-2 border rounded-lg"
                              value={filters.startDate || ''}
                              onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                            />
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              className="w-full pl-10 pr-4 py-2 border rounded-lg"
                              value={filters.endDate || ''}
                              onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                            />
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Health Score
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={filters.healthScoreMin || ''}
                            onChange={(e) => handleFilterChange({ healthScoreMin: parseInt(e.target.value) || undefined })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Health Score
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={filters.healthScoreMax || ''}
                            onChange={(e) => handleFilterChange({ healthScoreMax: parseInt(e.target.value) || undefined })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sort By
                        </label>
                        <div className="flex items-center space-x-4">
                          <select
                            className="flex-1 px-4 py-2 border rounded-lg"
                            value={filters.sortBy || 'created_at'}
                            onChange={(e) => handleFilterChange({ 
                              sortBy: e.target.value as 'created_at' | 'health_score' | 'product_name' 
                            })}
                          >
                            <option value="created_at">Date</option>
                            <option value="health_score">Health Score</option>
                            <option value="product_name">Product Name</option>
                          </select>
                          <button
                            onClick={() => handleFilterChange({ 
                              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                            })}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            {filters.sortOrder === 'asc' ? (
                              <SortAsc className="w-5 h-5" />
                            ) : (
                              <SortDesc className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          onClick={() => {
                            setFilters({ sortBy: 'created_at', sortOrder: 'desc' });
                            setShowFilters(false);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No analysis history found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <img
                        src={analysis.image_url}
                        alt={analysis.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {analysis.product_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4 inline-block mr-1" />
                          {formatDate(analysis.created_at)}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Health Score: {analysis.health_score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(analysis)}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(analysis.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Analysis
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this analysis? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History; 