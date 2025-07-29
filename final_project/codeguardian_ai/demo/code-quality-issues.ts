// Demo file 2: Code quality issues
// This file contains code that needs refactoring and improvement

interface DataItem {
  value: number;
  category: string;
}

function processData(data: DataItem[]): number[] {
  const result: number[] = [];
  
  // Multiple code quality issues
  for (let i = 0; i < data.length; i++) {  // Should use for...of or forEach
    if (data[i].value > 0) {  // Accessing array directly
      result.push(data[i].value * 2);  // Magic number
    }
  }
  
  return result;
}

// Poor error handling
async function fetchUserData(id: number) {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // No error checking
}

// Complex function that should be broken down
function calculateBulkPricing(items: any[], discounts: any, taxes: any, shipping: any) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    let itemPrice = items[i].price;
    if (items[i].category === 'electronics') {
      itemPrice = itemPrice * 0.9; // Magic number
    } else if (items[i].category === 'books') {
      itemPrice = itemPrice * 0.85; // Magic number
    }
    
    if (discounts[items[i].id]) {
      itemPrice = itemPrice * (1 - discounts[items[i].id] / 100);
    }
    
    total += itemPrice;
  }
  
  total += shipping.cost;
  total = total * (1 + taxes.rate);
  
  return total;
}

// Inconsistent naming and poor structure
class dataProcessor {
  private items: any[] = [];
  
  add_item(item: any) { // Inconsistent naming convention
    this.items.push(item);
  }
  
  processItems() {
    // No error handling
    return this.items.map(item => {
      return item.value * 2 + item.bonus; // Assumes properties exist
    });
  }
  
  getTotal() {
    let sum = 0;
    for (let i = 0; i < this.items.length; i++) {
      sum += this.items[i].value || 0;
    }
    return sum;
  }
}

export { processData, fetchUserData, calculateBulkPricing, dataProcessor };
