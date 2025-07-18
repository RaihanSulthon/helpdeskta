import React, { useState, useEffect } from 'react';
import { sendEmailAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';

const validators = {
  required: (value, fieldName) => {
    if (!value?.trim()) {
      return `${fieldName} harus diisi`;
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value?.trim())) {
      return 'Format email tidak valid';
    }
    if (value?.includes(' ')) {
      return 'Email tidak boleh mengandung spasi';
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (value?.trim().length < min) {
      return `${fieldName} minimal ${min} karakter`;
    }
    return null;
  },
};

const AdminEmailManagement = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to_email: '',
    subject: '',
    body: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const ticketInfo = location.state;

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Default kembali ke admin dashboard
      navigate('/admin/tickets');
    }
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation configuration
    const validationConfig = [
      () => validators.required(emailForm.to_email, 'Email tujuan'),
      () => validators.required(emailForm.subject, 'Subject email'),
      () => validators.required(emailForm.body, 'Isi email'),
      () => validators.email(emailForm.to_email),
      () => validators.minLength(emailForm.subject, 3, 'Subject'),
      () => validators.minLength(emailForm.body, 10, 'Isi email'),
    ];

    // Run validation
    const validationError = validationConfig
      .map((validate) => validate())
      .find((error) => error !== null);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSending(true);
      const result = await sendEmailAPI(emailForm);

      if (result.success) {
        setSuccess(`Email berhasil dikirim ke ${emailForm.to_email}!`);

        // Reset form
        setEmailForm({
          to_email: '',
          subject: '',
          body: '',
        });

        setError('');

        // Auto hide success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError('Gagal mengirim email: ' + result.message);
      }
    } catch (error) {
      setError('Gagal mengirim email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow h-auto`}>
      <Navigation topOffset="">
        <div className="mx-aute">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded transition-all hover:shadow-xl hover:scale-105 duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10H18M2 10L10 2M2 10L10 18"
                  stroke="#444746"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Ticket Detail Button */}
            <button className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium">
              <svg
                width="22"
                height="20"
                viewBox="0 0 22 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.2002 0.5H19.7998C20.249 0.5 20.6808 0.680504 21 1.00293C21.3194 1.32553 21.5 1.76428 21.5 2.22266V17.7773C21.5 18.2357 21.3194 18.6745 21 18.9971C20.6808 19.3195 20.249 19.5 19.7998 19.5H2.2002C1.75096 19.5 1.31921 19.3195 1 18.9971C0.680624 18.6745 0.5 18.2357 0.5 17.7773V2.22266C0.5 1.76428 0.680624 1.32553 1 1.00293C1.31921 0.680505 1.75096 0.5 2.2002 0.5ZM2.7998 16.0557H10.4004V12.833H2.7998V16.0557ZM2.7998 11.6113H19.2002V8.38867H2.7998V11.6113ZM2.7998 7.16699H19.2002V3.94434H2.7998V7.16699Z"
                  fill="#333333"
                  stroke="#333333"
                />
              </svg>
              <span>Ticket Detail</span>
            </button>

            {/* Feedback Button */}
            <button className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 border border-gray-500 rounded-md shadow-xl text-sm font-medium">
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.4092 7.38086C21.7593 8.52498 23.25 10.5925 23.25 12.8574C23.2499 14.1885 22.7409 15.4344 21.8477 16.4756L21.5479 16.8252L21.7236 17.25C22.0415 18.02 22.4653 18.7004 22.8018 19.1807C21.8379 19.0305 21.0144 18.6514 20.3682 18.248L20.0029 18.0195L19.6221 18.2197C18.3894 18.8678 16.9213 19.25 15.333 19.25C12.5831 19.2499 10.2094 18.1196 8.80078 16.4609C14.4682 16.3998 19.2637 12.4717 19.4092 7.38086ZM8.66699 0.75C13.1822 0.750144 16.5828 3.73976 16.583 7.14258C16.583 10.5455 13.1824 13.536 8.66699 13.5361C7.0801 13.5361 5.6109 13.15 4.37598 12.5049L3.99609 12.3066L3.63184 12.5332C2.98533 12.9367 2.16169 13.3167 1.19727 13.4668C1.53383 12.986 1.95825 12.3052 2.27637 11.5371L2.45215 11.1123L2.15332 10.7627C1.25849 9.71566 0.75 8.47315 0.75 7.14258C0.750186 3.73968 4.15157 0.75 8.66699 0.75ZM0.651367 14.1826L0.649414 14.1807C0.656513 14.1726 0.666326 14.1611 0.678711 14.1465C0.670118 14.1586 0.661652 14.1711 0.651367 14.1826Z"
                  stroke="#444746"
                  strokeWidth="1.5"
                />
              </svg>
              <span>Feedback</span>
            </button>

            {/* Email (Disposisi) Button */}
            <button className="flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 bg-white hover:bg-[#f8caca] text-[#333333] border border-gray-500 rounded-md shadow-xl text-sm font-medium">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  y="0.5"
                  width="20"
                  height="19"
                  fill="url(#pattern0_3370_21679)"
                />
                <defs>
                  <pattern
                    id="pattern0_3370_21679"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <use
                      xlinkHref="#image0_3370_21679"
                      transform="matrix(0.0416667 0 0 0.0438596 0 -0.00438596)"
                    />
                  </pattern>
                  <image
                    id="image0_3370_21679"
                    width="24"
                    height="23"
                    preserveAspectRatio="none"
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAXCAYAAAARIY8tAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANMSURBVHgBtVVbaxNBGD2zl2a7uWpb02rVaMU+eAFF8UGE+qYiKL4pCPqkP8E3BVHxB1gEBRFBX/VB9EG8teKDiIogglqtCq2mNEmTNJvsZsZvJrspMYm0VT92spnbOfOdMzPL0Cask/dSrqe9AkQCi4vH1at7dmvtej0Pqb8AB5icD2j4z2G06/AS3WCeaGrv7g3D7Ghcl64zJPsjDW1M0/Diyh8IZAitmcCKGAh3kXKM1dvMDh39G5Y2jX0hM0ieff+IYIZAP0JI6QCuKrV6jUn+F+DlIipf3sCO7gALdWI+odG8oQBPPlxhMYHfwOWbmTbgVrCQMNRcJpGFyjlmadg3GGGxkIa3k2U8GysqroAEYkH45IGc4INvTIZw5/hqlnOqGM+4OLc3iYsP06oEwPlcGc73Agnv1kGkB3bEbAAWvr4G6S3RmWy4frgfo5+LOHrzuxpweGsClw8tx+jYLEY/FRRJpeRiNlOSuTcQ5Kadlhlovui0egurEiYuP59WdVluvcyqQRuSHRCcg1erWGgYQtTkCVyNhfTa7qHCCVTKlSA/RJVGcDFvD7xsNmUPnviswV/teMYTEmznGlt6ogA3UVZxS8fIx4Kqq/Z5EFSzGZTGx2EdOJKq7SIquaLLLj5I4/z+XsTppOZKHo5sW4Lhp1MY+ZCXh0MNZJUStEKGcg/VAYWhY+KrCUZbmKW/QY9EgeQ6dQ8ZgRwy/eGRKWQKHnYN2IiTLBfuT2L4SboOLjNVIM4szZzzQ9CpLo45sGwTof611Dd3QbD4qbciACDJ6YjRwzn87ev7EchD728PUA6vgIgtUwBafhom4VmbtkCzLDSb7IksuZwQCpyzwEgRgHJfQ58wvGo5etZvRvr5a3BaqbVuAHpPb1s/DM2rbvGAlEzKUzlRY/7dkFaeOF131H8xuDCXdSHU3YWVh/ahlMnSmZgBr8zSNWLJK7SJgLViTZ25e4zSudaqT4/1oKNvTb1edengTU2hlHfAwgniMBqIWl7X1uD2NtQtCE0T0b4+2N0uCpM/UXY4eRGjjhr0P/uiSaL4yhWILo3SLstCOPJq4a0J6GuUxSKjc0kCXQOr0Wkz8Jn0l7ZCDNz4cdA02OI/+hSOVbz9C4xGk2NU1HE+AAAAAElFTkSuQmCC"
                  />
                </defs>
              </svg>
              <span>Disposisi (Email)</span>
            </button>

            {/* Delete Icon on the right */}
            <div className="flex-1 flex justify-end">
              <button className="p-2 hover:bg-red-100 rounded transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6504 0.349609V1.46094H15.6504V2.9834H14.6504V17.7773C14.6504 18.3062 14.4833 18.746 14.1523 19.1143C13.8228 19.4808 13.4441 19.651 13 19.6504H3C2.55614 19.6504 2.17835 19.4796 1.84863 19.1133C1.5179 18.7458 1.35019 18.3072 1.34961 17.7773V2.9834H0.349609V1.46094H5.34961V0.349609H10.6504ZM2.65039 18.1279H13.3496V2.9834H2.65039V18.1279ZM10.6504 5.90527V15.2051H9.34961V5.90527H10.6504ZM6.65039 5.90527V15.2051H5.34961V5.90527H6.65039Z"
                    fill="#444746"
                    stroke="#444746"
                    strokeWidth="0.7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Navigation>

      <div className="relative">
        <div className="absolute left-[20px] top-0 bottom-0 w-2 bg-orange-300"></div>

        {/* Main Container (All Email Section) */}
        <div className="px-8 pt-4 pb-6 space-y-6 pl-[50px]">
          {/* Email Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {/* {ticketData.title} */}
            </h1>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Tujuan <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="to_email"
                value={emailForm.to_email}
                onChange={handleEmailFormChange}
                required
                placeholder="contoh@telkomuniversity.ac.id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={emailForm.subject}
                onChange={handleEmailFormChange}
                required
                placeholder="Masukkan subject email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Isi Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Email <span className="text-red-500">*</span>
              </label>
              <textarea
                name="body"
                value={emailForm.body}
                onChange={handleEmailFormChange}
                required
                rows={8}
                placeholder="Tulis isi email di sini..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  sending
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {sending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengirim...
                  </div>
                ) : (
                  'Kirim Email'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailManagement;
