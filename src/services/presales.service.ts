import { eq, ilike, or, and, sql, desc, asc, inArray } from 'drizzle-orm';
import { db } from '../db/connection';
import { preSales, preSaleItems } from '../db/schema/presales';
import { customers } from '../db/schema/customers';
import { products } from '../db/schema/products';
import { BaseFilters, PreSaleStatus } from '../types/common.types';
import { 
  calculatePreSaleTotals, 
  validateStockForPreSale, 
  PreSaleItemCalculation,
  roundMoney 
} from '../utils/presales-calculations';

/**
 * PreSale entity interface
 */
export interface PreSale {
  id: string;
  customerId: string;
  status: PreSaleStatus;
  total: string;
  discount: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PreSaleItem entity interface
 */
export interface PreSaleItem {
  id: string;
  preSaleId: string;
  productId: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  discount: string;
}

/**
 * PreSale with items and related data
 */
export interface PreSaleWithItems extends PreSale {
  items: (PreSaleItem & {
    product: {
      id: string;
      code: string;
      name: string;
      unit: string;
      stock: number;
    };
  })[];
  customer: {
    id: string;
    name: string;
    email: string;
    cpf: string;
  };
}

/**
 * PreSale creation data interface
 */
export interface CreatePreSaleData {
  customerId: string;
  status?: PreSaleStatus;
  discount?: string;
  notes?: string | null;
  items: CreatePreSaleItemData[];
}

/**
 * PreSaleItem creation data interface
 */
export interface CreatePreSaleItemData {
  productId: string;
  quantity: string;
  unitPrice: string;
  discount?: string;
}

/**
 * PreSale update data interface
 */
export interface UpdatePreSaleData {
  customerId?: string;
  status?: PreSaleStatus;
  discount?: string;
  notes?: string | null;
  items?: UpdatePreSaleItemData[];
}

/**
 * PreSaleItem update data interface
 */
export interface UpdatePreSaleItemData {
  id?: string; // If provided, update existing item; if not, create new item
  productId: string;
  quantity: string;
  unitPrice: string;
  discount?: string;
}

/**
 * PreSales filters interface
 */
export interface PreSalesFilters extends BaseFilters {
  customerId?: string;
  status?: PreSaleStatus | PreSaleStatus[];
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * PreSales service class containing all pre-sales-related business logic
 */
export class PreSalesService {
  /**
   * Find all pre-sales with optional filtering
   */
  async findAll(filters: PreSalesFilters = {}): Promise<PreSale[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      customerId,
      status,
      customerName,
      dateFrom,
      dateTo,
      search
    } = filters;

    // Build where conditions
    const conditions = [];

    if (customerId) {
      conditions.push(eq(preSales.customerId, customerId));
    }

    if (status) {
      if (Array.isArray(status)) {
        conditions.push(inArray(preSales.status, status));
      } else {
        conditions.push(eq(preSales.status, status));
      }
    }

    if (dateFrom) {
      conditions.push(sql`${preSales.createdAt} >= ${new Date(dateFrom)}`);
    }

    if (dateTo) {
      conditions.push(sql`${preSales.createdAt} <= ${new Date(dateTo)}`);
    }

    // Handle customer name search and global search
    if (customerName || search) {
      const searchTerm = customerName || search;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${customers} 
          WHERE ${customers.id} = ${preSales.customerId} 
          AND ${ilike(customers.name, `%${searchTerm}%`)}
        )`
      );
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort order
    let orderBy;
    if (sortBy === 'createdAt') {
      orderBy = sortOrder === 'desc' ? desc(preSales.createdAt) : asc(preSales.createdAt);
    } else if (sortBy === 'total') {
      orderBy = sortOrder === 'desc' ? desc(preSales.total) : asc(preSales.total);
    } else if (sortBy === 'status') {
      orderBy = sortOrder === 'desc' ? desc(preSales.status) : asc(preSales.status);
    } else {
      orderBy = sortOrder === 'desc' ? desc(preSales.createdAt) : asc(preSales.createdAt);
    }

    // Apply pagination
    const offset = (page - 1) * limit;

    const result = await db
      .select()
      .from(preSales)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return result;
  }

  /**
   * Find pre-sale by ID with items and related data
   */
  async findById(id: string): Promise<PreSaleWithItems | null> {
    // Get pre-sale with customer data
    const preSaleResult = await db
      .select({
        id: preSales.id,
        customerId: preSales.customerId,
        status: preSales.status,
        total: preSales.total,
        discount: preSales.discount,
        notes: preSales.notes,
        createdAt: preSales.createdAt,
        updatedAt: preSales.updatedAt,
        customerName: customers.name,
        customerEmail: customers.email,
        customerCpf: customers.cpf,
      })
      .from(preSales)
      .innerJoin(customers, eq(preSales.customerId, customers.id))
      .where(eq(preSales.id, id))
      .limit(1);

    if (preSaleResult.length === 0) {
      return null;
    }

    const preSale = preSaleResult[0];

    // Get pre-sale items with product data
    const itemsResult = await db
      .select({
        id: preSaleItems.id,
        preSaleId: preSaleItems.preSaleId,
        productId: preSaleItems.productId,
        quantity: preSaleItems.quantity,
        unitPrice: preSaleItems.unitPrice,
        totalPrice: preSaleItems.totalPrice,
        discount: preSaleItems.discount,
        productCode: products.code,
        productName: products.name,
        productUnit: products.unit,
        productStock: products.stock,
      })
      .from(preSaleItems)
      .innerJoin(products, eq(preSaleItems.productId, products.id))
      .where(eq(preSaleItems.preSaleId, id));

    // Format the response
    const result: PreSaleWithItems = {
      id: preSale.id,
      customerId: preSale.customerId,
      status: preSale.status,
      total: preSale.total,
      discount: preSale.discount,
      notes: preSale.notes,
      createdAt: preSale.createdAt,
      updatedAt: preSale.updatedAt,
      customer: {
        id: preSale.customerId,
        name: preSale.customerName,
        email: preSale.customerEmail,
        cpf: preSale.customerCpf,
      },
      items: itemsResult.map(item => ({
        id: item.id,
        preSaleId: item.preSaleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        discount: item.discount,
        product: {
          id: item.productId,
          code: item.productCode,
          name: item.productName,
          unit: item.productUnit,
          stock: item.productStock,
        },
      })),
    };

    return result;
  }

  /**
   * Create a new pre-sale with items
   */
  async create(preSaleData: CreatePreSaleData): Promise<PreSaleWithItems> {
    // Validate customer exists
    await this.validateCustomerExists(preSaleData.customerId);

    // Validate products exist and have sufficient stock
    await this.validateProductsAndStock(preSaleData.items);

    // Calculate totals
    const { subtotal, total } = await this.calculateTotals(preSaleData.items, preSaleData.discount || '0');

    // Create pre-sale
    const preSaleResult = await db
      .insert(preSales)
      .values({
        customerId: preSaleData.customerId,
        status: preSaleData.status || 'draft',
        total: total.toString(),
        discount: preSaleData.discount || '0',
        notes: preSaleData.notes || null,
      })
      .returning();

    const createdPreSale = preSaleResult[0];

    // Create pre-sale items
    const itemsToInsert = preSaleData.items.map(item => {
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      const discount = parseFloat(item.discount || '0');
      const totalPrice = (quantity * unitPrice) - discount;

      return {
        preSaleId: createdPreSale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: totalPrice.toString(),
        discount: item.discount || '0',
      };
    });

    await db.insert(preSaleItems).values(itemsToInsert);

    // Return the created pre-sale with items
    const result = await this.findById(createdPreSale.id);
    if (!result) {
      throw new Error('Failed to retrieve created pre-sale');
    }

    return result;
  }

  /**
   * Update an existing pre-sale
   */
  async update(id: string, preSaleData: UpdatePreSaleData): Promise<PreSaleWithItems> {
    // Check if pre-sale exists
    const existingPreSale = await this.findById(id);
    if (!existingPreSale) {
      throw new Error('Pre-sale not found');
    }

    // Validate customer if provided
    if (preSaleData.customerId) {
      await this.validateCustomerExists(preSaleData.customerId);
    }

    // Validate status transition if provided
    if (preSaleData.status) {
      this.validateStatusTransition(existingPreSale.status, preSaleData.status);
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle items update if provided
    if (preSaleData.items) {
      // Validate products and stock
      await this.validateProductsAndStock(preSaleData.items);

      // Delete existing items
      await db.delete(preSaleItems).where(eq(preSaleItems.preSaleId, id));

      // Insert new items
      const itemsToInsert = preSaleData.items.map(item => {
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const discount = parseFloat(item.discount || '0');
        const totalPrice = (quantity * unitPrice) - discount;

        return {
          preSaleId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: totalPrice.toString(),
          discount: item.discount || '0',
        };
      });

      await db.insert(preSaleItems).values(itemsToInsert);

      // Recalculate totals
      const { subtotal, total } = await this.calculateTotals(preSaleData.items, preSaleData.discount || existingPreSale.discount);
      updateData.total = total.toString();
    }

    if (preSaleData.customerId !== undefined) {
      updateData.customerId = preSaleData.customerId;
    }

    if (preSaleData.status !== undefined) {
      updateData.status = preSaleData.status;
    }

    if (preSaleData.discount !== undefined) {
      updateData.discount = preSaleData.discount;
      
      // Recalculate total if discount changed and no items update
      if (!preSaleData.items) {
        const currentItems = existingPreSale.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        }));
        const { subtotal, total } = await this.calculateTotals(currentItems, preSaleData.discount);
        updateData.total = total.toString();
      }
    }

    if (preSaleData.notes !== undefined) {
      updateData.notes = preSaleData.notes;
    }



    // Update pre-sale
    await db
      .update(preSales)
      .set(updateData)
      .where(eq(preSales.id, id));

    // Return updated pre-sale
    const result = await this.findById(id);
    if (!result) {
      throw new Error('Failed to retrieve updated pre-sale');
    }

    return result;
  }

  /**
   * Delete a pre-sale and all its items
   */
  async delete(id: string): Promise<void> {
    // Check if pre-sale exists
    const existingPreSale = await this.findById(id);
    if (!existingPreSale) {
      throw new Error('Pre-sale not found');
    }

    // Delete pre-sale (items will be deleted automatically due to cascade)
    await db.delete(preSales).where(eq(preSales.id, id));
  }

  /**
   * Update pre-sale status
   */
  async updateStatus(id: string, status: PreSaleStatus): Promise<PreSale> {
    // Check if pre-sale exists
    const existingPreSale = await db
      .select()
      .from(preSales)
      .where(eq(preSales.id, id))
      .limit(1);

    if (existingPreSale.length === 0) {
      throw new Error('Pre-sale not found');
    }

    // Validate status transition
    this.validateStatusTransition(existingPreSale[0].status, status);

    // Update status
    const result = await db
      .update(preSales)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(preSales.id, id))
      .returning();

    return result[0];
  }

  /**
   * Calculate totals for pre-sale items using calculation utilities
   */
  async calculateTotals(items: CreatePreSaleItemData[] | UpdatePreSaleItemData[], globalDiscount: string = '0'): Promise<{ subtotal: number; total: number }> {
    // Convert items to calculation format
    const calculationItems: PreSaleItemCalculation[] = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || '0',
    }));

    // Use calculation utility
    const result = calculatePreSaleTotals(calculationItems, globalDiscount, 'fixed');

    return {
      subtotal: roundMoney(result.subtotal),
      total: roundMoney(result.total),
    };
  }

  /**
   * Count total pre-sales with filters
   */
  async count(filters: PreSalesFilters = {}): Promise<number> {
    const { customerId, status, customerName, dateFrom, dateTo, search } = filters;

    const conditions = [];

    if (customerId) {
      conditions.push(eq(preSales.customerId, customerId));
    }

    if (status) {
      if (Array.isArray(status)) {
        conditions.push(inArray(preSales.status, status));
      } else {
        conditions.push(eq(preSales.status, status));
      }
    }

    if (dateFrom) {
      conditions.push(sql`${preSales.createdAt} >= ${new Date(dateFrom)}`);
    }

    if (dateTo) {
      conditions.push(sql`${preSales.createdAt} <= ${new Date(dateTo)}`);
    }

    if (customerName || search) {
      const searchTerm = customerName || search;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${customers} 
          WHERE ${customers.id} = ${preSales.customerId} 
          AND ${ilike(customers.name, `%${searchTerm}%`)}
        )`
      );
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(preSales)
      .where(whereCondition);

    return result[0].count;
  }

  /**
   * Private method to validate customer exists
   */
  private async validateCustomerExists(customerId: string): Promise<void> {
    const customer = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customer.length === 0) {
      throw new Error('Customer not found');
    }
  }

  /**
   * Private method to validate products exist and have sufficient stock using calculation utilities
   */
  private async validateProductsAndStock(items: CreatePreSaleItemData[] | UpdatePreSaleItemData[]): Promise<void> {
    // Convert items to calculation format
    const calculationItems: PreSaleItemCalculation[] = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || '0',
    }));

    // Use stock validation utility
    const validation = await validateStockForPreSale(calculationItems);

    if (!validation.isValid) {
      throw new Error(validation.errors.join('; '));
    }
  }

  /**
   * Private method to validate status transitions
   */
  private validateStatusTransition(currentStatus: PreSaleStatus, newStatus: PreSaleStatus): void {
    const validTransitions: Record<PreSaleStatus, PreSaleStatus[]> = {
      draft: ['pending', 'cancelled'],
      pending: ['approved', 'cancelled'],
      approved: ['converted', 'cancelled'],
      cancelled: [], // Cannot transition from cancelled
      converted: [], // Cannot transition from converted
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}

// Export singleton instance
export const preSalesService = new PreSalesService();