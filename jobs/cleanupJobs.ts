import { Agenda } from "@hokify/agenda";
import { AwilixContainer } from "awilix";
import TutorialService from "../services/TutorialService";

export default function (agenda: Agenda, container: AwilixContainer) {
  agenda.define("delete unpublished tutorials", async (job) => {
    const tutorialService: TutorialService =
      container.resolve("tutorialService");
    const deletedCount = await tutorialService.deleteUnpublishedTutorials();
    job.attrs.data = { deletedCount };
  });
}
