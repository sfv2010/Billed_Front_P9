/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

//Mock the module to use the mockStore module
jest.mock("../app/store", () => mockStore);
const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );
    });
    afterEach(() => {
        document.body.innerHTML = "";
        localStorage.clear();
    });
    describe("When I am on NewBill Page", () => {
        test("Then ,the content title should be displayed ", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            //to-do write assertion
            expect(
                screen.getAllByText("Envoyer une note de frais")
            ).toBeTruthy();
        });
    });

    describe("When I am on NewBill Page and When I upload a file  ", () => {
        test("Then, The file should upload correctly", () => {
            document.body.innerHTML = NewBillUI();
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const initNewBills = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const file = screen.getByTestId("file");
            const handleChangeFile = jest.fn(initNewBills.handleChangeFile);
            file.addEventListener("change", handleChangeFile);
            //The File() constructor creates a new File object instance.
            const testFile = new File(["testFile"], "test.jpg", {
                type: "image/jpg",
            });
            fireEvent.change(file, {
                target: {
                    files: [testFile],
                },
            });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(file.files[0].name).toBe("test.jpg");
        });
    });

    describe("when I am on NewBill Page and I click the submit button", () => {
        test("Then, handleSubmit function should be called", async () => {
            document.body.innerHTML = NewBillUI();
            const initNewBills = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const submit = screen.getByTestId("form-new-bill");
            const handleSubmit = jest.fn(initNewBills.handleSubmit);
            submit.addEventListener("submit", handleSubmit);
            fireEvent.submit(submit);
            expect(handleSubmit).toHaveBeenCalled();
        });
    });
    //Post integration test
    describe("When I am on NewBill Page and I submit a valid bill form", () => {
        test("then a bill is created", async () => {
            document.body.innerHTML = NewBillUI();
            const initNewBills = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const imgFile = new File(["test.txt"], "test.txt", {
                type: "text/txt",
            });
            const inputFile = screen.getByTestId("file");
            const handleChangeFile = jest.fn((e) =>
                initNewBills.handleChangeFile(e)
            );
            inputFile.addEventListener("change", handleChangeFile);
            fireEvent.change(inputFile, { target: { files: [imgFile] } });

            const createBill = jest.fn(mockStore.bills().create);
            const updateBill = jest.fn(mockStore.bills().update);
            const { fileUrl, key } = await createBill();

            expect(createBill).toHaveBeenCalledTimes(1);
            expect(key).toBe("1234");
            expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");

            const newBillUpdate = await updateBill();
            expect(updateBill).toHaveBeenCalledTimes(1);

            expect(newBillUpdate).toEqual({
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl:
                    "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                status: "pending",
                type: "Hôtel et logement",
                commentary: "séminaire billed",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "2004-04-04",
                amount: 400,
                commentAdmin: "ok",
                email: "a@a",
                pct: 20,
            });
            let searchURL = ROUTES_PATH.Bills;
            searchURL = searchURL.slice(-5);
            expect(searchURL).toBe("bills");
        });
    });

    describe("When I am on NewBill Page and I submit a incomplete bill form", () => {
        test("then a message required field is displayed", async () => {
            document.body.innerHTML = NewBillUI();
            const initNewBills = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const submit = screen.getByTestId("form-new-bill");

            const handleSubmit = jest.fn((e) => initNewBills.handleSubmit(e));
            initNewBills.createBill = (initNewBills) => initNewBills;
            document.querySelector(`input[data-testid="expense-name"]`).value =
                "";
            document.querySelector(`input[data-testid="datepicker"]`).value =
                "";
            document.querySelector(`select[data-testid="expense-type"]`).value =
                "";
            document.querySelector(`input[data-testid="amount"]`).value = "";
            document.querySelector(`input[data-testid="vat"]`).value = "";
            document.querySelector(`input[data-testid="pct"]`).value = "";
            document.querySelector(`textarea[data-testid="commentary"]`).value =
                "";
            initNewBills.fileUrl = "";
            initNewBills.fileName = "";
            submit.addEventListener("click", handleSubmit);
            fireEvent.click(submit);
            let searchURL = ROUTES_PATH.NewBill;
            searchURL = searchURL.slice(-3);
            expect(searchURL).toBe("new");
        });
    });
});
