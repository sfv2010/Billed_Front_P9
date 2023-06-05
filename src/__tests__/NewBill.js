/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

//Mock the module to use the mockStore module
jest.mock("../app/store", () => mockStore);

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
        test("Then, handleSubmit function should be called", () => {
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

            const formNewBill = screen.getByTestId("form-new-bill");
            const handleSubmit = jest.fn(initNewBills.handleSubmit);
            formNewBill.addEventListener("submit", handleSubmit);
            fireEvent.submit(formNewBill);
            expect(handleSubmit).toHaveBeenCalled();
        });
    });
});

//Post integration test
describe("Given I am connected as an employee", () => {
    describe("When I create a new bill", () => {
        test("fetches NewBill from mock API POST", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "a@a",
                })
            );
            document.body.innerHTML = NewBillUI();
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            // For tracking mocked API methods
            const createSpy = jest.spyOn(mockStore.bills(), "create");
            // const createSpy = jest
            //     .spyOn(mockStore.bills(), "create")
            //     .mockResolvedValue({
            //         fileUrl: "https://localhost:3456/images/test.jpg",
            //         key: "1234",
            //     });
            const updateSpy = jest.spyOn(mockStore.bills(), "update");
            console.log("createSpy", createSpy);

            expect(jest.spyOn(mockStore.bills(), "create")).toBe(createSpy);
            const initNewBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Form input data
            const billData = {
                type: "Hôtel et logement",
                name: "Test Bill",
                amount: 100,
                date: "2023-06-01",
                vat: "20",
                pct: 20,
                commentary: "Test comment",
                fileUrl: "../img/hotel.png",
                fileName: "hotel.png",
                file: new File(["testFile"], "test.jpg", {
                    type: "image/jpg",
                }),
            };

            // // Get form element and set value
            const typeInput = screen.getByTestId("expense-type");
            fireEvent.change(typeInput, { target: { value: billData.type } });
            expect(typeInput.value).toBe(billData.type);

            const nameInput = screen.getByTestId("expense-name");
            fireEvent.change(nameInput, { target: { value: billData.name } });

            const amountInput = screen.getByTestId("amount");
            fireEvent.change(amountInput, {
                target: { value: billData.amount },
            });

            const dateInput = screen.getByTestId("datepicker");
            fireEvent.change(dateInput, { target: { value: billData.date } });

            const vatInput = screen.getByTestId("vat");
            fireEvent.change(vatInput, { target: { value: billData.vat } });

            const pctInput = screen.getByTestId("pct");
            fireEvent.change(pctInput, { target: { value: billData.pct } });

            const commentaryInput = screen.getByTestId("commentary");
            fireEvent.change(commentaryInput, {
                target: { value: billData.commentary },
            });
            initNewBill.fileUrl = billData.fileUrl;
            initNewBill.fileName = billData.fileName;

            const sendExpenseText = await waitFor(() =>
                screen.getByText("Envoyer une note de frais")
            );
            expect(sendExpenseText).toBeTruthy();

            // Mock file upload processing
            const file = screen.getByTestId("file");
            // const testFile = new File(["testFile"], "test.jpg", {
            //     type: "image/jpg",
            // });
            fireEvent.change(file, {
                target: {
                    files: [billData.file],
                },
            });
            console.log("file", file.files[0]);
            console.log("testFile", billData.file.name);
            expect(file.files[0]).toBe(billData.file);

            const formNewBill = screen.getByTestId("form-new-bill");
            fireEvent.submit(formNewBill);
            // Wait for form submission and Check that updateSpy was called
            //await waitFor(() => expect(createSpy).toHaveBeenCalled());
            await waitFor(() => expect(updateSpy).toHaveBeenCalled());

            // Check if the expected form data was passed to the API method

            // Check that the screen transitions after submitting the form
            const billHeaderText = await waitFor(() =>
                screen.getByText("Mes notes de frais")
            );
            expect(billHeaderText).toBeTruthy();
        });
    });
});
