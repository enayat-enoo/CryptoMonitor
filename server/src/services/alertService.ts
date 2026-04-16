import Alert from "../models/alertModel";
import { getCryptoPrice } from "./fetcherService";
import { getIO } from "../config/socket";  // add this helper

export const evaluateAlerts = async () => {
  const alerts = await Alert.find({ triggered: false });

  for (const alert of alerts) {
    const price = await getCryptoPrice(alert.coinID, alert.currency);

    if (
      (alert.condition === "above" && price > alert.targetPrice) ||
      (alert.condition === "below" && price < alert.targetPrice)
    ) {
      console.log(
        `Alert triggered for ${alert.coinID}: current price ${price} is ${alert.condition} ${alert.targetPrice}`
      );

      //Mark as triggered
      alert.triggered = true;
      await alert.save();

      //Emit real-time alert
      const io = getIO();
      io.emit("alert", {
        coin: alert.coinID,
        currency: alert.currency,
        target: alert.targetPrice,
        condition: alert.condition,
        currentPrice: price,
      });
    }
  }
};
