/**
 * Mock AI Analysis Service.
 * Implements the 5 AI scenarios specified in Section 7:
 * - auto: cycles high -> medium -> low
 * - high: branded item, narrow range, high confidence
 * - medium: brand known, model unknown, wider range, medium confidence
 * - low: unbranded, wide range, low confidence
 * - flagged: moderation fails with friendly block message
 */
import type { AiService, AnalyzeItemParams, AiAnalysisResult } from '@/services/types';
import { useDemoStore } from '@/store/demoStore';
import { simulateLatency } from './utils';

let autoCycleIndex = 0;

export const mockAiService: AiService = {
  async analyzeItem(params: AnalyzeItemParams): Promise<AiAnalysisResult> {
    // Post flow specifies ~2.5s simulated inspection
    await simulateLatency(1800);

    const { aiScenario } = useDemoStore.getState();

    let scenario = aiScenario;
    if (scenario === 'auto') {
      const cycle: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
      scenario = cycle[autoCycleIndex % cycle.length];
      autoCycleIndex++;
    }

    if (scenario === 'flagged') {
      return {
        safe: false,
        labels: ['Inappropriate Item', 'Restricted Substance'],
        identification: {
          title: 'Flagged Content',
          category: 'Other',
          condition: 'fair',
          description: '',
        },
        estimate: {
          min: 0,
          max: 0,
          confidence: 'low',
          reasoning: 'Item flagged by automated content safety filters.',
          mock: true,
        },
        moderationReason:
          'This item appears to contain restricted or prohibited content and cannot be listed on ReHome.',
      };
    }

    if (scenario === 'high') {
      return {
        safe: true,
        labels: ['Kitchen Appliance', 'Prestige Mixer', 'Electric Grinder'],
        identification: {
          title: 'Prestige 750W Mixer Grinder',
          brand: 'Prestige',
          model: 'Iris 750W',
          category: 'Kitchen',
          condition: 'good',
          description: 'High-power 750W copper motor mixer grinder with 3 stainless steel jars.',
        },
        estimate: {
          min: 1400,
          max: 1800,
          confidence: 'high',
          brand: 'Prestige',
          model: 'Iris 750W',
          reasoning: 'Verified model with active resale market demand in metropolitan areas.',
          mock: true,
        },
      };
    }

    if (scenario === 'medium') {
      return {
        safe: true,
        labels: ['Laptop', 'Dell Computer', 'Workstation'],
        identification: {
          title: 'Dell Inspiron 15-inch Laptop',
          brand: 'Dell',
          category: 'Electronics',
          condition: 'good',
          description: 'Dell 15-inch laptop with Intel Core processor, original adapter included.',
        },
        estimate: {
          min: 8000,
          max: 14000,
          confidence: 'medium',
          brand: 'Dell',
          reasoning: 'Brand verified; exact model specifications required for narrower valuation.',
          mock: true,
        },
      };
    }

    // Default 'low' scenario
    return {
      safe: true,
      labels: ['Wooden Table', 'Study Desk', 'Furniture'],
      identification: {
        title: 'Solid Wood Study Table',
        category: 'Furniture',
        condition: 'good',
        description: 'Sturdy wooden desk with storage drawer and natural wood finish.',
      },
      estimate: {
        min: 1200,
        max: 2800,
        confidence: 'low',
        reasoning: 'Unbranded handcrafted furniture; valuation depends on local physical inspection.',
        mock: true,
      },
    };
  },
};
