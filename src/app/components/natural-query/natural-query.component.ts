import { Component } from '@angular/core';
import { QueryService, NaturalQueryResult } from '../../services/query.service';

@Component({
  selector: 'app-natural-query',
  templateUrl: './natural-query.component.html',
  styleUrls: ['./natural-query.component.scss']
})
export class NaturalQueryComponent {
  userQuery = '';
  originalQuery = '';  // Store original for refinement
  result: NaturalQueryResult | null = null;
  error: string = '';
  loading = false;
  showPipeline = false;
  showSaveDialog = false;
  showRefineForm = false;
  showEventDetail = false;
  selectedEvent: any = null;
  refinementHint = '';
  saveName = '';
  saveDescription = '';
  saveTags = 'natural-language';
  saveError = '';
  saveSuccess = '';
  
  // Manual pipeline entry
  showManualEntry = false;
  manualPipeline = '';
  manualDescription = '';
  manualBasedOn = '';
  manualTestResults: any = null;
  manualError = '';
  
  examples = [
    "Show me all goals by Messi",
    "Find penalty kicks that were saved",
    "Show successful passes by Barcelona",
    "Find all shots in the first half",
    "Show me dribbles that led to goals"
  ];
  
  constructor(private queryService: QueryService) {}
  
  executeQuery() {
    if (!this.userQuery.trim()) {
      this.error = 'Please enter a query';
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.result = null;
    this.originalQuery = this.userQuery;  // Store original
    
    this.queryService.naturalQuery(this.userQuery).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
        
        if (response.mock) {
          this.error = '⚠️ Running in mock mode (LLM not configured). Results may be limited.';
        }
      },
      error: (err) => {
        this.error = err.error?.error || err.message || 'Query failed';
        this.loading = false;
      }
    });
  }
  
  useExample(example: string) {
    this.userQuery = example;
    this.executeQuery();
  }
  
  togglePipeline() {
    this.showPipeline = !this.showPipeline;
  }
  
  getColumns(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj).filter(key => !key.startsWith('_'));
  }
  
  formatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
  
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return '#4caf50';
    if (confidence >= 0.6) return '#ff9800';
    return '#f44336';
  }

  openSaveDialog() {
    if (!this.result) return;
    
    this.showSaveDialog = true;
    this.saveError = '';
    this.saveSuccess = '';
    
    // Pre-fill with query explanation
    this.saveDescription = this.result.explanation || this.userQuery;
    this.saveName = this.generateQueryName(this.userQuery);
  }

  closeSaveDialog() {
    this.showSaveDialog = false;
    this.saveName = '';
    this.saveDescription = '';
    this.saveTags = 'natural-language';
    this.saveError = '';
    this.saveSuccess = '';
  }

  saveQuery() {
    if (!this.result) return;
    
    if (!this.saveName.trim()) {
      this.saveError = 'Query name is required';
      return;
    }

    const tags = this.saveTags.split(',').map(t => t.trim()).filter(t => t);
    
    this.queryService.saveQuery({
      name: this.saveName,
      description: this.saveDescription || this.userQuery,
      pipeline: this.result.pipeline,
      tags: tags
    }).subscribe({
      next: (response) => {
        this.saveSuccess = `Query "${this.saveName}" saved successfully!`;
        setTimeout(() => this.closeSaveDialog(), 2000);
      },
      error: (err) => {
        this.saveError = err.error?.error || 'Failed to save query';
      }
    });
  }

  useSimilarQuery(queryName: string) {
    // Load and execute the existing query
    this.queryService.getQuery(queryName).subscribe({
      next: (query) => {
        this.userQuery = query.description || query.name;
        this.executeQuery();
      },
      error: (err) => {
        this.error = 'Failed to load query';
      }
    });
  }

  private generateQueryName(query: string): string {
    // Generate a clean query name from the user's input
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  toggleRefineForm() {
    this.showRefineForm = !this.showRefineForm;
    if (this.showRefineForm) {
      this.refinementHint = '';
      // Restore original query for editing
      this.userQuery = this.originalQuery;
    }
  }

  refineQuery() {
    if (!this.refinementHint.trim() && this.userQuery === this.originalQuery) {
      this.error = 'Please modify the query or add a hint';
      return;
    }

    // Build refined query with optional hint
    let refinedQuery = this.userQuery;
    if (this.refinementHint.trim()) {
      refinedQuery = `${this.userQuery}. Additional context: ${this.refinementHint}`;
    }
    
    this.loading = true;
    this.error = '';
    this.originalQuery = this.userQuery;  // Update original
    
    this.queryService.naturalQuery(refinedQuery, { execute: true }).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
        this.showRefineForm = false;
        
        // Show success message
        this.error = '✅ Query refined successfully!';
        setTimeout(() => {
          if (this.error.startsWith('✅')) this.error = '';
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || err.message || 'Refinement failed';
        this.loading = false;
      }
    });
  }

  viewEventDetail(event: any) {
    this.selectedEvent = event;
    this.showEventDetail = true;
  }

  closeEventDetail() {
    this.showEventDetail = false;
    this.selectedEvent = null;
  }

  getEventJson(event: any): string {
    return JSON.stringify(event, null, 2);
  }

  copyEventJson() {
    if (this.selectedEvent) {
      const json = this.getEventJson(this.selectedEvent);
      navigator.clipboard.writeText(json).then(() => {
        alert('Event JSON copied to clipboard!');
      });
    }
  }

  toggleManualEntry() {
    console.log('[DEBUG] toggleManualEntry called, current showManualEntry:', this.showManualEntry);
    this.showManualEntry = !this.showManualEntry;
    console.log('[DEBUG] toggled showManualEntry to:', this.showManualEntry);
    if (this.showManualEntry && this.result) {
      // Pre-fill with current pipeline if available
      this.manualPipeline = JSON.stringify(this.result.pipeline, null, 2);
      this.manualDescription = this.result.explanation || this.userQuery;
      this.manualBasedOn = this.result.saved_as || '';
      console.log('[DEBUG] Pre-filled pipeline, description:', this.manualDescription);
    }
    this.manualError = '';
    this.manualTestResults = null;
  }

  deleteQuery() {
    if (!this.result?.saved_as) {
      return;
    }

    if (!confirm(`Are you sure you want to delete query "${this.result.saved_as}"?`)) {
      return;
    }

    this.loading = true;
    this.queryService.deleteQuery(this.result.saved_as).subscribe({
      next: (response) => {
        this.loading = false;
        alert(`Query "${this.result!.saved_as}" deleted successfully!`);
        // Clear the result
        this.result = null;
        this.userQuery = '';
        this.error = '';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to delete query';
        alert('Error: ' + this.error);
      }
    });
  }

  testManualPipeline() {
    if (!this.manualPipeline.trim()) {
      this.manualError = 'Pipeline is required';
      return;
    }

    let pipeline: any[];
    try {
      pipeline = JSON.parse(this.manualPipeline);
      if (!Array.isArray(pipeline)) {
        this.manualError = 'Pipeline must be a JSON array';
        return;
      }
    } catch (e) {
      this.manualError = 'Invalid JSON: ' + (e as Error).message;
      return;
    }

    this.loading = true;
    this.manualError = '';
    this.manualTestResults = null;

    this.queryService.saveManualQuery({
      description: this.manualDescription || 'Manual query',
      pipeline: pipeline,
      execute: true,
      based_on: this.manualBasedOn || undefined
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.manualTestResults = response;
        if (response.validation_warnings && response.validation_warnings.length > 0) {
          this.manualError = '⚠️ Warning: ' + response.validation_warnings.map((w: any) => w.message).join('; ');
        }
      },
      error: (err) => {
        this.loading = false;
        this.manualError = err.error?.error || err.error?.details || 'Pipeline test failed';
      }
    });
  }

  saveManualQuery() {
    if (!this.manualPipeline.trim()) {
      this.manualError = 'Pipeline is required';
      return;
    }

    if (!this.manualDescription.trim()) {
      this.manualError = 'Description is required';
      return;
    }

    let pipeline: any[];
    try {
      pipeline = JSON.parse(this.manualPipeline);
      if (!Array.isArray(pipeline)) {
        this.manualError = 'Pipeline must be a JSON array';
        return;
      }
    } catch (e) {
      this.manualError = 'Invalid JSON: ' + (e as Error).message;
      return;
    }

    this.loading = true;
    this.manualError = '';

    this.queryService.saveManualQuery({
      description: this.manualDescription,
      pipeline: pipeline,
      execute: false,
      based_on: this.manualBasedOn || undefined,
      tags: ['manual', 'user-created']
    }).subscribe({
      next: (response) => {
        this.loading = false;
        alert(`✅ Query saved as "${response.name}"`);
        this.showManualEntry = false;
        this.manualPipeline = '';
        this.manualDescription = '';
        this.manualBasedOn = '';
      },
      error: (err) => {
        this.loading = false;
        this.manualError = err.error?.error || 'Failed to save query';
      }
    });
  }

  copyCurrentPipeline() {
    if (this.result && this.result.pipeline) {
      this.manualPipeline = JSON.stringify(this.result.pipeline, null, 2);
      this.manualDescription = this.result.explanation || this.userQuery;
      this.manualBasedOn = this.result.saved_as || '';
    }
  }
}
