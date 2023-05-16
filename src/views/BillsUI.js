import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";
import Actions from "./Actions.js";

const row = (bill) => {
    return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

//The rows function takes multiple billing data and transforms each data into a table row using the row function.
const rows = (data) => {
    //sort descending order

    return data && data.length
        ? sortData(data)
              .map((bill) => row(bill))
              .join("")
        : "";
};
function sortData(data) {
    return data.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
}

const rows1 = (data) => {
    //sort descending order
    const sortData = [...data].sort((a, b) =>
        convertDateFormat(a.date) < convertDateFormat(b.date) ? 1 : -1
    );
    console.log(sortData);
    return sortData && sortData.length
        ? sortData.map((bill) => row(bill)).join("")
        : "";
};

const convertMonthFormat = {
    "Jan.": 1,
    "Fév.": 2,
    "Mar.": 3,
    "Avr.": 4,
    "Mai.": 5,
    "Jui.": 6,
    "Jui.": 7,
    "Aoû.": 8,
    "Sep.": 9,
    "Oct.": 10,
    "Nov.": 11,
    "Déc.": 12,
};

function convertDateFormat(date) {
    let [day, monthShort, year] = date.split(" ");
    const month = convertMonthFormat[monthShort];
    //year = `20${year}`;
    console.log(new Date(`20${year}`, month, day));
    return new Date(`20${year}`, month, day);
}

//The modal function generates the HTML content of the modal dialog for the file.
export default ({ data: bills, loading, error }) => {
    const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

    if (loading) {
        return LoadingPage();
    } else if (error) {
        return ErrorPage(error);
    }

    return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
