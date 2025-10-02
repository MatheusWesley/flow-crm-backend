import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema/users.js';
import { hashPassword, comparePassword } from '../utils/password-hash.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { User, CreateUserData, LoginCredentials, AuthResponse, AuthService } from '../types/auth.types.js';

/**
 * Authentication service implementation
 */
class AuthServiceImpl implements AuthService {
  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise that resolves to user data and JWT token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult[0];

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Register a new user (admin only functionality)
   * @param userData - User registration data
   * @returns Promise that resolves to created user data
   */
  async register(userData: CreateUserData): Promise<User> {
    const { email, password, name, role } = userData;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const newUserResult = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      })
      .returning();

    const newUser = newUserResult[0];

    // Return user data without password
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  /**
   * Validate JWT token and return user data
   * @param token - JWT token to validate
   * @returns Promise that resolves to user data
   */
  async validateToken(token: string): Promise<User> {
    try {
      // Verify and decode token
      const payload = await verifyToken(token);

      // Find user by ID from token
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (userResult.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult[0];

      // Return user data without password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Promise that resolves to hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return await hashPassword(password);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns Promise that resolves to true if passwords match
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await comparePassword(password, hash);
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns Promise that resolves to user data or null
   */
  async findById(id: string): Promise<User | null> {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    const user = userResult[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns Promise that resolves to user data or null
   */
  async findByEmail(email: string): Promise<User | null> {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    const user = userResult[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl();