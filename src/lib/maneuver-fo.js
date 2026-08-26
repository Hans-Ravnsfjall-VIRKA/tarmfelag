const onto = (s) => s ? ` inn á ${s}` : "";
const along = (s) => s ? ` eftir ${s}` : "";
function foInstruction(step) {
  const s = step.street_names && step.street_names[0] || "";
  switch (step.type) {
    case 1:
    case 2:
    case 3:
      return `Byrja ferð${along(s)}`;
    case 4:
    case 5:
    case 6:
      return "Tú ert komin á mál";
    case 7:
    case 8:
      return `Halt beint fram${along(s)}`;
    case 9:
      return `Halt eitt sindur til høgru${onto(s)}`;
    case 10:
      return `Draga til høgru${onto(s)}`;
    case 11:
      return `Draga skarpt til høgru${onto(s)}`;
    case 12:
      return "Vend við til høgru";
    case 13:
      return "Vend við til vinstru";
    case 14:
      return `Draga skarpt til vinstru${onto(s)}`;
    case 15:
      return `Draga til vinstru${onto(s)}`;
    case 16:
      return `Halt eitt sindur til vinstru${onto(s)}`;
    case 17:
      return "Halt beint fram";
    case 18:
      return "Tak avkoyringina til høgru";
    case 19:
      return "Tak avkoyringina til vinstru";
    case 20:
      return "Tak avkoyringina til høgru";
    case 21:
      return "Tak avkoyringina til vinstru";
    case 22:
      return "Halt beint fram";
    case 23:
      return "Halt til høgru";
    case 24:
      return "Halt til vinstru";
    case 25:
    case 37:
    case 38:
      return `Legg teg inn á vegin${onto(s)}`;
    case 26:
      return "Koyr inn í rundkoyringina";
    case 27:
      return `Koyr út úr rundkoyringini${onto(s)}`;
    case 28:
      return "Far umborð á ferjuna";
    case 29:
      return "Far av ferjuni";
    default:
      return step.instruction || "Halt fram";
  }
}
export {
  foInstruction
};
