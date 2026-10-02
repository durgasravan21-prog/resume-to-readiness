import { inngest } from './inngest-client';
import { runAnalysisPipeline } from '../ai/pipeline/run-analysis';

export const analyzeResumeJob = inngest.createFunction(
  {
    id: 'analyze-candidate-resume',
    retries: 2,
  },
  { event: 'analysis.requested' },
  async ({ event, step }) => {
    const { analysisId, rawResumeText, targetRole } = event.data;

    await step.run('execute-pipeline', async () => {
      await runAnalysisPipeline(analysisId, rawResumeText, targetRole);
    });

    return { success: true, analysisId };
  }
);
