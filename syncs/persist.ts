import { actions, Frames, Vars } from "../engine/mod.ts";

export const makePersistenceSyncs = ({ MeaningMaker, Review, Persistence }: any) => {
  const PersistJobStatus = ({ job, manuscript, status, stage }: Vars) => ({
    when: actions(
      [MeaningMaker.updateStatus, { job, status, stage }, {}],
    ),
    then: actions(
      [Persistence.saveJob, { job, manuscript: job, status, stage }],
    ),
  });

  const PersistJobSummary = ({ job, summary }: Vars) => ({
    when: actions(
      [MeaningMaker.setSummary, { job, summary }, {}],
    ),
    then: actions(
      [Persistence.saveJob, { job, manuscript: job, status: "completed", stage: "done", summary }],
    ),
  });

  const PersistReviewRecord = ({ review, manuscript, stage, output }: Vars) => ({
    when: actions(
      [Review.record, { review, manuscript, stage, output }, {}],
    ),
    then: actions(
      [Persistence.saveReview, { review, manuscript, stage, output }],
    ),
  });

  return { PersistJobStatus, PersistJobSummary, PersistReviewRecord };
};


