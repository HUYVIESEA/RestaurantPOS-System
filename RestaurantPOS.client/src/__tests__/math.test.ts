import { sum, subtract, multiply, divide } from '../utils/math';

describe('Math utilities', () => {
  describe('sum', () => {
    it('adds two positive numbers correctly', () => {
      expect(sum(1, 2)).toBe(3);
    });

    it('adds negative and positive numbers correctly', () => {
      expect(sum(-1, 1)).toBe(0);
    });

    it('adds two negative numbers correctly', () => {
      expect(sum(-1, -2)).toBe(-3);
    });

    it('adds zero correctly', () => {
      expect(sum(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('subtracts two positive numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('subtracts negative numbers correctly', () => {
      expect(subtract(-1, -2)).toBe(1);
    });

    it('subtracts zero correctly', () => {
      expect(subtract(10, 0)).toBe(10);
    });
  });

  describe('multiply', () => {
    it('multiplies two positive numbers correctly', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('multiplies by zero correctly', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it('multiplies negative numbers correctly', () => {
      expect(multiply(-2, 3)).toBe(-6);
    });
  });

  describe('divide', () => {
    it('divides two positive numbers correctly', () => {
      expect(divide(8, 2)).toBe(4);
    });

    it('divides by negative number correctly', () => {
      expect(divide(10, -2)).toBe(-5);
    });

    it('throws error when dividing by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero');
    });
  });
});