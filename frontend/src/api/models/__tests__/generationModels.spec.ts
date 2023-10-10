import { describe, it, expect } from 'vitest';
import { convertDateTime } from '../generationModels';

describe('transformDateTime', () => {
  it('provides the correct output at 00:30am', () => {
    const result = convertDateTime("29042023", "3000");
    expect(result.getTime()).toBe(1682728200000);
  });
  it('provides the correct output when the date is 01/05', () => {
    const result = convertDateTime("01052023", "144834");
    expect(result.getTime()).toBe(1682952514000);
  });
  it('provides the correct output on 29/04 at 6:45pm', () => {
    const result = convertDateTime("29042023", "184500");
    expect(result.getTime()).toBe(1682793900000);
  });
  it('provides the correct output on 10/10 at 10:00am', () => {
    const result = convertDateTime("10102023", "90000");
    expect(result.getTime()).toBe(1696928400000);
  })
});