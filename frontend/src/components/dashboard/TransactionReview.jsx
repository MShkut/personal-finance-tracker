import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, TrendingUp, TrendingDown, Wallet,
  Calendar, Building2, DollarSign, Tag, Split
} from 'lucide-react';

import { TransactionHelpers as isSplitWorthy } from 'utils/transactionHelpers';
import { useTheme } from 'contexts/ThemeContext';

export const TransactionReview = ({ 
  transactions, 
  categories, 
  onCategoryChange, 
  onConfirm, 
  onSplitTransaction 
}) => {
  const { isDarkMode } = useTheme();
  const [sortBy, setSortBy] = useState('confidence');
  const [filterBy, setFilterBy] = useState('all');

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === 'confidence') return a.confidence - b.confidence;
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
    return 0;
  });

  const filteredTransactions = sortedTransactions.filter(t => {
    if (filterBy === 'low-confidence') return t.confidence < 0.7;
    if (filterBy === 'unconfirmed') return !t.confirmed;
    if (filterBy === 'all') return true;
    return t.category?.type === filterBy;
  });

  const stats = transactions.reduce((acc, t) => {
    const type = t.category?.type || 'unknown';
    acc[type] = (acc[type] || 0) + Math.abs(t.amount);
    acc.lowConfidence = (acc.lowConfidence || 0) + (t.confidence < 0.7 ? 1 : 0);
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const getConfidenceBadgeColor = (confidence) => {
    if (confidence >= 0.8) return isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700';
    if (confidence >= 0.5) return isDarkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
    return isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-4 text-center ${
          isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
        }`}>
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            ${(stats.income || 0).toFixed(0)}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
            Income
          </div>
        </div>
        <div className={`rounded-lg p-4 text-center ${
          isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
        }`}>
          <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-1" />
          <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            ${(stats.expense || 0).toFixed(0)}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
            Expenses
          </div>
        </div>
        <div className={`rounded-lg p-4 text-center ${
          isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
        }`}>
          <Wallet className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            ${(stats.savings || 0).toFixed(0)}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            Savings
          </div>
        </div>
        <div className={`rounded-lg p-4 text-center ${
          isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
        }`}>
          <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <div className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {stats.lowConfidence || 0}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
            Need Review
          </div>
        </div>
      </div>

      {/* Controls and Confirm Button */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="confidence">Sort by Confidence</option>
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="all">All Transactions</option>
            <option value="low-confidence">Low Confidence</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
            <option value="savings">Savings</option>
          </select>
        </div>
        
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Confirm All ({transactions.length})
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No transactions match the current filter.</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`rounded-lg p-4 shadow-sm border-l-4 transition-all hover:shadow-md ${
                transaction.confirmed 
                  ? 'border-green-400' 
                  : transaction.confidence < 0.5 
                    ? 'border-red-400'
                    : transaction.confidence < 0.8 
                      ? 'border-yellow-400' 
                      : 'border-blue-400'
              } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Transaction Header */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {transaction.description}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(transaction.confidence)}`}>
                      {getConfidenceText(transaction.confidence)} ({Math.round(transaction.confidence * 100)}%)
                    </div>
                    {transaction.originalData?.splitFrom && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                      }`}>
                        Split {transaction.originalData.splitIndex}/{transaction.originalData.splitTotal}
                      </div>
                    )}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className={`font-bold ${
                        transaction.amount > 0 
                          ? isDarkMode ? 'text-green-400' : 'text-green-600'
                          : isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <select
                        value={transaction.category?.id || ''}
                        onChange={(e) => onCategoryChange(transaction.id, e.target.value)}
                        className={`px-2 py-1 border rounded text-sm ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-100' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="">Select category...</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => onSplitTransaction(transaction)}
                      className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                        isSplitWorthy(transaction)
                          ? isDarkMode 
                            ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : isDarkMode 
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={isSplitWorthy(transaction) ? 'This transaction looks like it could be split' : 'Split this transaction'}
                    >
                      <Split className="w-3 h-3" />
                      Split
                      {isSplitWorthy(transaction) && (
                        <span className="ml-1 text-xs">💡</span>
                      )}
                    </button>
                  </div>
                  
                  {/* Additional Transaction Info */}
                  {transaction.originalData?.source === 'manual' && (
                    <div className={`mt-2 text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ✏️ Manually entered
                    </div>
                  )}
                </div>
                
                {/* Status Icon and Category Color */}
                <div className="flex items-center gap-2 ml-4">
                  {transaction.confirmed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" title="Confirmed" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" title="Needs review" />
                  )}
                  <div 
                    className={`w-3 h-3 rounded-full ${transaction.category?.color || 'bg-gray-400'}`}
                    title={transaction.category?.name || 'No category'}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {filteredTransactions.length > 0 && (
        <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredTransactions.length} of {transactions.length} transactions
          {filterBy !== 'all' && (
            <span className="ml-2">
              (filtered by {filterBy.replace('-', ' ')})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
