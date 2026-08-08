'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
  collapsible?: boolean;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onClear,
  className = '',
  collapsible = true,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(!collapsible);

  const activeFiltersCount = Object.values(values).filter(value => 
    value !== undefined && value !== '' && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const renderFilter = (filter: FilterOption) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onChange(filter.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((val: string) => {
                const option = filter.options?.find(opt => opt.value === val);
                return (
                  <Badge key={val} variant="secondary" className="text-xs">
                    {option?.label || val}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => {
                        const newValues = selectedValues.filter((v: string) => v !== val);
                        onChange(filter.key, newValues);
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
            <Select
              value=""
              onValueChange={(val) => {
                if (val && !selectedValues.includes(val)) {
                  onChange(filter.key, [...selectedValues, val]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Add ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={selectedValues.includes(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={filter.key}
              checked={value || false}
              onCheckedChange={(checked) => onChange(filter.key, checked)}
            />
            <Label htmlFor={filter.key}>{filter.label}</Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              {filter.type !== 'checkbox' && (
                <Label htmlFor={filter.key}>{filter.label}</Label>
              )}
              {renderFilter(filter)}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}