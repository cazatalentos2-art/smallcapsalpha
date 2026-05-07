import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onRefresh, isRefreshing }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stock/${search.trim().toUpperCase()}`);
      setSearch('');
    }
  };

  return (
    <header className="h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Buscar ticker..."
            className="pl-9 w-64 bg-secondary border-border font-mono text-sm h-9"
          />
        </div>
      </form>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-4 mr-4 text-xs font-mono text-muted-foreground">
          <span>SPY <span className="text-primary">+0.42%</span></span>
          <span>QQQ <span className="text-primary">+0.67%</span></span>
          <span>VIX <span className="text-destructive">18.32</span></span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </header>
  );
}