import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("https://paperfree.bigbeetle.net/");

// ID of the document we'll use to store view count
const RECORD_ID = "dlu233hb9ia8wod";

async function updateViewCount() {
  try {
    // Try to get the record by ID
    let record;

    record = await pb.collection("viewcounter").getOne(RECORD_ID);

    console.log(record);

    const updated = await pb.collection("viewcounter").update(record.id, {
      count: record.count + 1,
    });
    console.log(updated);

    const counterElement = document.getElementById("viewcounter");
    if (counterElement) {
      counterElement.textContent = updated.count;
      counterElement.setAttribute("data-count", updated.count);
      console.log(updated);
      if (typeof animateCounter === "function") {
        animateCounter(counterElement, updated.count);
      }
    }
  } catch (err) {
    console.error("View counter error:", err);
  }
}

updateViewCount();
