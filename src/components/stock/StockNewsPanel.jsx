import React from 'react';
import { Newspaper } from 'lucide-react';

export default function StockNewsPanel({ news = [] }) {
  if (news.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Newspaper className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No hay noticias recientes</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg divide-y divide-border">
      {news.map((item, i) => (
        <div key={i} className="p-4 hover:bg-secondary/30 transition-colors">
          <h4 className="text-sm font-medium leading-snug">{item.title}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            {item.source && (
              <span className="text-xs text-muted-foreground">{item.source}</span>
            )}
            {item.date && (
              <span className="text-xs text-muted-foreground">{item.date}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}