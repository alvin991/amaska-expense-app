export const formatLocalDate = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone