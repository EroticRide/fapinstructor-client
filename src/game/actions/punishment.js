import store from "store";
import createProbability from "game/utils/createProbability";
import {
  addRubberBand,
  snapRubberBand,
  addClothespin,
  applyIcyHot,
  applyToothpaste,
  ballslaps,
  squeezeBalls,
  headPalming,
  bindCockAndBalls,
  holdBreath,
  scratchChest,
  scratchShoulders,
  scratchThighs,
  flickCockHead,
  flickNipples,
  rubIceOnBalls,
  eatPrecum,
  insertButtPlug,
  handsOff,
  setStrokeStyleHandsOff,
} from "game/actions";
import { applyProbability } from "game/actions/generateAction";
import createNotification from "engine/createNotification";
import { getRandomPunishmentMessage } from "game/texts/teasing_messages";
import delay from "utils/delay";
import { getCurrentStrokeStyle, setStrokeStyle } from "game/enums/StrokeStyle";
import { getRandomStrokeSpeed, setStrokeSpeed } from "game/utils/strokeSpeed";
import { ActionService } from "game/xstate/services";

const SECONDS_IN_MILLI_SECONDS = 1000; // Factor

/**
 * Fetches one of all activated punishments.
 * @returns {action}
 *   A random action
 */
const getRandomPunishment = () => {
  const chosenActions = initializePunishments(store.config.tasks);
  return applyProbability(chosenActions, 1)[0];
};

/**
 * Task that chooses a random punishment from all available.
 * Every time a punishment is required the chance to be denied in the end is increased (affects AdvancedOrgasm only)
 *
 * @since      27.09.2018
 * @author     the1nstructor
 *
 * @alias      punishment
 * @memberof   actions
 */
const punishment = async () => {
  const punish = getRandomPunishment();
  const message = getRandomPunishmentMessage();
  createNotification({ message });

  store.game.orgasm = false; // A (May be Any) Task was not fulfilled properly -> no orgasm this round
  store.game.chanceForDenial += 5;
  let strokeStyle = getCurrentStrokeStyle();
  await setStrokeStyleHandsOff();
  setStrokeSpeed(0);

  await delay(6 * SECONDS_IN_MILLI_SECONDS);

  ActionService.execute(punish);

  await setStrokeStyle(strokeStyle, true);

  await setStrokeSpeed(getRandomStrokeSpeed()); //since not every punishment does this ... it may happen twice
  // sometimes.
  await delay(SECONDS_IN_MILLI_SECONDS);
};
punishment.label = "Punishment";

/**
 * Manually created list of all punishments:
 * We use a task configuration to determine if the task is active. We will get to this in the next step.
 * createProbability takes your action and the probability percentage the action will be invoked as a punishment.
 *
 * @param taskConfigs
 *   the configuration file (usually store.config.tasks)
 * @returns {*[]}
 *   an array with all the function-probability pairs: {func, probability}
 */
export const initializePunishments = (taskConfigs = store.config.tasks) =>
  [
    // speed
    createProbability(handsOff, 33), // is always included
    // cbt
    taskConfigs.rubberBands && createProbability(addRubberBand, 50),
    taskConfigs.icyHot && createProbability(applyIcyHot, 10),
    taskConfigs.toothpaste && createProbability(applyToothpaste, 25),
    taskConfigs.ballSlaps && createProbability(ballslaps, 10),
    taskConfigs.squeezeBalls && createProbability(squeezeBalls, 15),
    taskConfigs.headPalming && createProbability(headPalming, 5),
    taskConfigs.bindCockBalls &&
      !store.game.cockAndBallsBound &&
      createProbability(bindCockAndBalls, 50),
    taskConfigs.rubberBands &&
      parseInt(store.game.rubberBands, 10) > 0 &&
      createProbability(snapRubberBand, 33),
    taskConfigs.breathPlay && createProbability(holdBreath, 20),
    taskConfigs.scratching && createProbability(scratchChest, 10),
    taskConfigs.scratching && createProbability(scratchThighs, 10),
    taskConfigs.scratching && createProbability(scratchShoulders, 5),
    taskConfigs.flicking && createProbability(flickCockHead, 40),
    createProbability(flickNipples, 33), // is also always included
    taskConfigs.cbtIce && createProbability(rubIceOnBalls, 33),
    // anal
    taskConfigs.buttplug &&
      !store.game.buttPlugInserted &&
      createProbability(insertButtPlug, 45),
    // cei
    taskConfigs.precum && createProbability(eatPrecum, 15),
    // nipples
    taskConfigs.clothespins &&
      store.game.clothespins < 2 &&
      createProbability(addClothespin, 50),
  ].filter((action) => !!action);

export default punishment;
