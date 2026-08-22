---
name: nextjs-codebase-rules
description: >-
  Quy tắc mặc định khi tạo mới, chỉnh sửa, review hoặc mở rộng codebase Next.js.
  Sử dụng skill này khi làm việc với dự án Next.js để đảm bảo code đúng, đơn giản,
  nhất quán, dễ đọc, dễ bảo trì và đủ tốt cho nhu cầu thực tế.
---

# Next.js Codebase Rules

## 1. Mục tiêu

Mọi thay đổi trong dự án cần ưu tiên:

- Code dễ đọc, dễ bảo trì và dễ mở rộng.
- Kiến trúc rõ ràng, tránh over-engineering.
- Tách biệt trách nhiệm giữa UI, business logic, data access và integration.
- Tận dụng đúng khả năng của Next.js và React.
- Ưu tiên type-safety với TypeScript.
- Không tạo abstraction khi chưa thực sự cần thiết.
- Không thay đổi hành vi hiện tại ngoài phạm vi yêu cầu.
- Không tự ý thêm dependency nếu có thể giải quyết bằng API/platform hiện có.

---

## 2. Công nghệ mặc định

Trừ khi yêu cầu của dự án quy định khác, sử dụng:

- Next.js với App Router.
- React.
- TypeScript.
- Server Components mặc định.
- Client Components chỉ khi thực sự cần.
- ESLint.
- CSS Modules, Tailwind CSS hoặc solution styling đã tồn tại trong dự án.
- `fetch` hoặc data-access layer hiện có của dự án để gọi API.
- Environment variables cho các cấu hình phụ thuộc môi trường.

Không tự ý thay đổi framework, state-management library, styling library hoặc package manager đang được sử dụng trong codebase.

---

## 3. Nguyên tắc làm việc với codebase hiện tại

Trước khi viết code:

1. Đọc cấu trúc thư mục hiện tại.
2. Xác định convention đang được sử dụng.
3. Tìm component, hook, utility, type hoặc service có thể tái sử dụng.
4. Kiểm tra dependency hiện có trước khi cài package mới.
5. Xác định phần nào chạy trên server và phần nào chạy trên client.
6. Chỉ chỉnh sửa những file thực sự liên quan đến yêu cầu.

Luôn ưu tiên consistency với codebase hiện tại hơn việc áp đặt một convention mới.

Không refactor diện rộng nếu yêu cầu chỉ là sửa một chức năng nhỏ.

---

## 4. Cấu trúc thư mục khuyến nghị

Có thể sử dụng cấu trúc sau nếu dự án chưa có convention riêng:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   └── feature-name/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── schemas/
│       └── utils/
│
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
├── constants/
└── config/
```

Không bắt buộc tạo tất cả thư mục nếu chưa cần. Ưu tiên colocate code theo feature khi dự án bắt đầu lớn.

---

## 5. Quy tắc App Router

Sử dụng đúng vai trò của các file đặc biệt trong App Router:

- `page.tsx`: UI của route.
- `layout.tsx`: layout dùng chung.
- `loading.tsx`: loading UI.
- `error.tsx`: error boundary phía client.
- `not-found.tsx`: UI cho tài nguyên không tồn tại.
- `route.ts`: HTTP route handler.
- `template.tsx`: chỉ dùng khi thực sự cần remount subtree.

Không đặt toàn bộ business logic trực tiếp trong `page.tsx`. `page.tsx` nên tập trung vào: nhận params/search params, gọi data layer cần thiết, compose component, quyết định layout/render ở cấp route.

---

## 6. Server Components và Client Components

### Server Components

Mặc định sử dụng Server Components. Phù hợp cho:

- Fetch dữ liệu, đọc database, đọc secrets.
- Xử lý dữ liệu trước khi render.
- Render nội dung không cần browser API.
- Giảm JavaScript gửi xuống client.

### Client Components

Chỉ thêm `"use client"` khi cần ít nhất một trong các yếu tố sau:

- `useState`, `useReducer`, `useEffect`.
- Event handlers phía client.
- Browser APIs.
- Client-only libraries.
- Interactive UI cần state phía browser.

Không thêm `"use client"` ở layout hoặc component cấp cao chỉ vì một component con cần tương tác. Đẩy Client Component xuống thấp nhất có thể trong component tree.

---

## 7. Component Design

Component cần:

- Có một trách nhiệm chính rõ ràng.
- Tên phản ánh đúng mục đích.
- Props tối thiểu và dễ hiểu.
- Không chứa business logic phức tạp nếu có thể tách riêng.
- Không phụ thuộc trực tiếp vào nhiều nguồn dữ liệu không liên quan.
- Dễ test và tái sử dụng khi hợp lý.

Ưu tiên composition thay vì tạo component với quá nhiều boolean props:

```tsx
// Tránh
<Card showHeader showFooter isEditable isAdminMode isCompact />

// Ưu tiên
<Card>
  <CardHeader />
  <CardContent />
  <CardFooter />
</Card>
```

---

## 8. Naming Convention

### File và folder

```text
user-profile.tsx
user-profile-form.tsx
use-user-profile.ts
user.service.ts
user.types.ts
user.schema.ts
```

### Component: PascalCase

```tsx
UserProfile, UserProfileForm, DashboardHeader
```

### Function và variable: camelCase

```ts
getUserById, createOrder, isLoading, currentUser
```

### Constants: camelCase hoặc UPPER_SNAKE_CASE tùy convention hiện tại

Không trộn nhiều naming convention trong cùng một codebase.

---

## 9. TypeScript Rules

- Không sử dụng `any` trừ trường hợp bất khả kháng. Ưu tiên `unknown`.
- Định nghĩa type rõ ràng cho: Props, API request/response, domain models, form values, function return values khi TypeScript không thể infer rõ ràng.
- Không duplicate cùng một type ở nhiều nơi.
- Tái sử dụng type từ source-of-truth phù hợp.
- Không tạo interface/type phức tạp khi chỉ sử dụng một lần và không làm code dễ hiểu hơn.

---

## 10. Data Fetching

Data fetching nên được thực hiện tại server khi có thể:

```tsx
const data = await getUsers();
```

trong Server Component thay vì fetch lại từ `useEffect` phía client nếu không có lý do cần client-side fetching.

Không tạo API route nội bộ chỉ để Server Component gọi lại chính backend của Next.js nếu server có thể gọi trực tiếp service/data layer:

```text
// Tránh: Server Component → /api/users → Database
// Ưu tiên: Server Component → User Service → Database
```

---

## 11. API và Service Layer

Không gọi API rải rác trong nhiều component nếu cùng một domain có thể dùng chung data-access layer.

Service nên chịu trách nhiệm: gửi request, chuẩn hóa request, parse response, xử lý lỗi ở mức integration phù hợp.

UI component không nên chứa logic HTTP phức tạp.

---

## 12. Environment Variables

Không hard-code API URL, secret key, token, database connection string, third-party credentials, environment-specific configuration.

Chỉ biến thực sự cần public ở browser mới được prefix bằng `NEXT_PUBLIC_`. Không đặt secret trong biến `NEXT_PUBLIC_*`.

---

## 13. State Management

Ưu tiên theo thứ tự:

1. Server Component data.
2. URL/search params.
3. Local component state.
4. React Context cho state chia sẻ phạm vi nhỏ.
5. Global state library khi thực sự có nhu cầu.

Không đưa mọi state vào global store. State nên sống ở nơi gần consumer nhất có thể.

---

## 14. URL là nguồn trạng thái

Các state có lợi khi bookmark, share hoặc refresh nên lưu trong URL: search query, pagination, filter, sort, selected tab quan trọng.

---

## 15. Form

Form cần có: validation rõ ràng, error message có ý nghĩa, loading/submitting state, disable action khi đang submit nếu cần, prevent duplicate submission, reset hoặc redirect hợp lý sau khi thành công.

Validation phía client chỉ phục vụ UX. Dữ liệu quan trọng vẫn phải được validate lại phía server.

---

## 16. Error Handling

Không silent catch exception:

```ts
// Tránh
try { await saveData(); } catch {}

// Ưu tiên
try {
  await saveData();
} catch (error) {
  console.error("Failed to save data", error);
  throw error;
}
```

UI phải có trạng thái phù hợp cho: Loading, Empty data, Error, Success.

---

## 17. Loading State

Sử dụng khi phù hợp: `loading.tsx`, Skeleton, Spinner, Pending state, Optimistic UI.

Loading indicator phải phù hợp với phạm vi thao tác. Không block toàn bộ trang nếu chỉ một button đang submit.

---

## 18. Empty State

Danh sách rỗng cần có empty state có ý nghĩa giúp người dùng hiểu: không có dữ liệu vì sao, có thể làm gì tiếp theo, có action tạo mới hay thay đổi filter hay không.

---

## 19. Performance

Tránh các lỗi rõ ràng:

- Fetch cùng dữ liệu nhiều lần không cần thiết.
- Render Client Component quá lớn.
- Import thư viện nặng chỉ để dùng một utility nhỏ.
- Render danh sách lớn không có chiến lược phù hợp.
- Gửi secrets hoặc data không cần thiết xuống client.
- Tạo state/effect không cần thiết.

Không sử dụng `useMemo` và `useCallback` một cách máy móc. Chỉ dùng khi có lý do rõ ràng.

---

## 20. React Effects

Không dùng `useEffect` để xử lý logic có thể tính trực tiếp trong render:

```tsx
// Tránh
const [fullName, setFullName] = useState("");
useEffect(() => { setFullName(`${firstName} ${lastName}`); }, [firstName, lastName]);

// Ưu tiên
const fullName = `${firstName} ${lastName}`;
```

`useEffect` chủ yếu dùng để synchronize với external system hoặc browser environment.

---

## 21. Hooks

Custom Hook phải bắt đầu bằng `use`. Không tạo custom hook nếu chỉ wrap một dòng logic và không mang lại abstraction hữu ích.

Hook không nên vừa fetch data, thao tác UI, điều hướng và chứa business logic phức tạp cùng lúc.

---

## 22. Styling

Tuân theo styling solution hiện tại của dự án. Không tự ý kết hợp nhiều hệ thống styling.

UI cần: Responsive, Consistent spacing, Consistent typography, Reuse design tokens, Hạn chế magic numbers, Có hover/focus/disabled state phù hợp.

---

## 23. Responsive Design

Mọi UI mới cần được xem xét ít nhất ở Mobile, Tablet, Desktop. Không hard-code width lớn khiến giao diện overflow trên mobile.

---

## 24. Accessibility

Ưu tiên semantic HTML: `button`, `nav`, `main`, `section`, `article`, `label`, `input` thay vì dùng `div` cho mọi thứ.

- Button action phải dùng `<button>` thay vì clickable `<div>`.
- Input cần label phù hợp.
- Image cần `alt` phù hợp.
- Interactive element phải có keyboard accessibility.
- Không xóa focus outline nếu không thay bằng focus indicator tốt hơn.

---

## 25. Image và Navigation

- Ưu tiên `next/image` cho ảnh. Luôn xác định kích thước hoặc layout strategy phù hợp.
- Ưu tiên `next/link` cho internal navigation.
- Ưu tiên router API của Next.js khi cần navigation programmatically.
- Không sử dụng `window.location.href` cho internal navigation trừ trường hợp có lý do cụ thể.

---

## 26. Security

- Không tin dữ liệu từ client. Luôn validate và authorize ở server cho các thao tác nhạy cảm.
- Không dựa chỉ vào việc ẩn button phía frontend để kiểm soát permission.
- Không expose secrets, internal tokens, database credentials, sensitive server data.
- Sanitize dữ liệu khi cần.

---

## 27. Authentication và Authorization

- Authentication trả lời: Người dùng là ai?
- Authorization trả lời: Người dùng được phép làm gì?

Không trộn hai khái niệm này. Mọi server action, route handler hoặc API endpoint nhạy cảm phải tự kiểm tra permission. Không chỉ kiểm tra permission ở UI.

---

## 28. Server Actions

Nếu dự án sử dụng Server Actions: validate input, authenticate user, authorize action, xử lý lỗi rõ ràng, revalidate hoặc redirect phù hợp, không đặt toàn bộ business logic trực tiếp trong action.

Server Action nên gọi application/service layer khi logic bắt đầu phức tạp.

---

## 29. Route Handlers

Route Handler chỉ nên chịu trách nhiệm các việc ở boundary HTTP: parse request, validate request, authentication, authorization, gọi service, convert result thành HTTP response.

Không đặt business logic lớn trực tiếp trong `route.ts`.

---

## 30. Business Logic

Business logic nên độc lập với UI càng nhiều càng tốt:

```text
UI → Application/Service → Domain logic
```

Điều này giúp: test dễ hơn, reuse dễ hơn, component nhỏ hơn, logic ít phụ thuộc framework hơn.

---

## 31. Dependency Rules

Trước khi thêm package mới:

1. Kiểm tra project đã có package tương đương chưa.
2. Kiểm tra Web API, React hoặc Next.js có hỗ trợ trực tiếp không.
3. Đánh giá package có thực sự cần thiết không.
4. Không thêm dependency chỉ để giải quyết vài dòng code đơn giản.

Không tự ý upgrade major version dependency ngoài phạm vi yêu cầu.

---

## 32. Import

Giữ import rõ ràng và nhất quán. Ưu tiên path alias nếu codebase đã cấu hình:

```ts
import { Button } from "@/components/ui/button"; // ưu tiên
// thay vì: import { Button } from "../../../../components/ui/button";
```

Không tạo circular dependency.

---

## 33. Utility Functions và Constants

Utility function cần: pure khi có thể, có tên mô tả rõ mục đích, không phụ thuộc UI, không chứa hidden side effects. Không tạo file `utils.ts` khổng lồ chứa mọi function không liên quan.

Không lặp lại magic string/magic number quan trọng. Không biến mọi literal nhỏ thành constant nếu điều đó làm code khó đọc hơn.

---

## 34. Comments

Comment giải thích **vì sao**, không mô tả lại code đang làm gì:

```ts
// Tránh: // Increment count
count++;

// Phù hợp: // API giới hạn batch tối đa 100 records.
const batchSize = 100;
```

Không giữ comment lỗi thời. Không để TODO không có ngữ cảnh.

---

## 35. Code Simplicity và Abstraction

Ưu tiên giải pháp đơn giản nhất đáp ứng yêu cầu. Không tạo Repository pattern, Factory, Adapter, Abstract base class, Generic helper, State machine, Event bus chỉ vì "có thể sẽ cần trong tương lai".

Chỉ extract khi: logic giống nhau thật sự, cùng thay đổi vì cùng một lý do, abstraction mới làm code dễ hiểu hơn. Duplication nhỏ đôi khi tốt hơn abstraction sai.

---

## 36. Pagination, Search và Filter

- List có khả năng lớn nên có chiến lược pagination phù hợp. Pagination state nên được đặt trong URL.
- Không filter dataset lớn hoàn toàn trên client nếu backend có thể xử lý hiệu quả hơn.
- Search input nên debounce nếu mỗi lần nhập đều gây network request.
- Filter quan trọng nên phản ánh vào URL.

---

## 37. Optimistic Update

Chỉ dùng khi: UX được cải thiện rõ ràng, có chiến lược rollback, failure state được xử lý chính xác.

---

## 38. File Upload

Khi upload file cần kiểm tra: file type, file size, permission, filename handling, storage failure, server-side validation. Không tin `Content-Type` do client gửi như nguồn xác thực duy nhất.

---

## 39. SEO và Metadata

Đối với public pages, sử dụng Metadata API của Next.js. Cân nhắc: Title, Description, Canonical URL, Open Graph, Social metadata, Structured data khi cần. Không thêm SEO metadata phức tạp cho internal dashboard nếu không có yêu cầu.

---

## 40. Error Message

Error message cho người dùng: ngắn gọn, dễ hiểu, không leak stack trace, không leak internal implementation. Error nội bộ có thể có detail hơn trong logging.

---

## 41. Date và Time

Không xử lý timezone một cách ngầm định. Cần xác định rõ giá trị lưu dưới timezone nào, backend trả về format gì, UI hiển thị theo timezone nào. Ưu tiên ISO 8601 cho data interchange.

---

## 42. Testing

Ưu tiên test: business logic, critical user flow, permission, validation, edge cases, regression bugs. Không test implementation detail không cần thiết.

Tên test nên mô tả hành vi:

```ts
it("returns forbidden when user does not have delete permission", async () => {});
```

---

## 43. Logging

- Không để `console.log` debug trong production code.
- Nếu dự án có logger, sử dụng logger thống nhất.
- Không log: password, access token, refresh token, secret, sensitive personal data.

---

## 44. API Response

Giữ response structure nhất quán theo convention hiện tại của backend. Xử lý rõ: Success, Validation error, Unauthorized, Forbidden, Not found, Conflict, Internal error.

---

## 45. Khi sửa bug

1. Xác định root cause.
2. Không chỉ che symptom.
3. Sửa với phạm vi nhỏ nhất hợp lý.
4. Kiểm tra ảnh hưởng tới code liên quan.
5. Thêm hoặc cập nhật test nếu phù hợp.
6. Không refactor phần không liên quan.

---

## 46. Khi thêm feature

Trước khi code cần xác định: Input, Output, User flow, Loading state, Error state, Empty state, Permission, Mobile behavior, Data source, Edge cases. Không chỉ implement happy path.

---

## 47. Khi refactor

Refactor phải giữ nguyên behavior trừ khi yêu cầu nói khác. Không trộn refactor + feature lớn + formatting toàn repository trong cùng một thay đổi. Ưu tiên commit/change nhỏ và dễ review.

---

## 48. Khi review code

Luôn kiểm tra: Correctness, Security, Type-safety, Server/Client boundary, Data fetching, Error handling, Performance, Accessibility, Maintainability, Consistency với codebase.

---

## 49. Quy tắc dành cho AI/LLM khi chỉnh sửa code

- Đọc code liên quan trước khi thay đổi.
- Không đoán cấu trúc hoặc API nếu có thể kiểm tra trong codebase.
- Không invent function, component, route, environment variable hoặc database field không tồn tại mà không nói rõ.
- Tái sử dụng code hiện có trước khi tạo mới.
- Không thay đổi public API ngoài phạm vi yêu cầu.
- Không xóa logic chưa hiểu rõ.
- Không cài dependency mới nếu không thật sự cần.
- Không tạo file dư thừa, comment dài dòng, abstraction mang tính suy đoán.
- Không thay đổi formatting của file không liên quan.
- Không rewrite toàn bộ file nếu chỉ cần sửa một khu vực nhỏ.
- Sau khi sửa, kiểm tra type/lint/test/build nếu môi trường cho phép.

Nếu có nhiều giải pháp, ưu tiên:

```text
Correctness → Simplicity → Consistency → Maintainability → Performance → Abstraction
```

---

## 50. Quy tắc output

- Đi thẳng vào vấn đề. Nói rõ file nào được thay đổi.
- Nêu lý do cho các quyết định quan trọng. Nêu assumptions nếu có.
- Không giải thích kiến thức cơ bản không liên quan.
- Code phải hoàn chỉnh trong phạm vi được yêu cầu.
- Không dùng pseudo-code nếu người dùng yêu cầu code chạy được.
- Không bỏ qua import quan trọng.
- Giữ formatting nhất quán với repository.

---

## 51. Definition of Done

Một thay đổi hoàn thành khi:

- Code compile/type-check thành công.
- Không còn lỗi lint mới.
- Không phá behavior hiện tại ngoài phạm vi yêu cầu.
- Error/loading/empty state được xử lý khi cần.
- Permission và validation được kiểm tra ở đúng layer.
- Không expose secret.
- UI responsive nếu có thay đổi giao diện.
- Không tạo duplication hoặc abstraction không cần thiết.
- Không để debug code.
- Code phù hợp convention hiện tại của dự án.

---

## 52. Nguyên tắc ưu tiên khi có xung đột

1. Yêu cầu cụ thể của task hiện tại.
2. Quy tắc business/domain của dự án.
3. Convention đã được sử dụng nhất quán trong codebase.
4. Tài liệu này.
5. Sở thích cá nhân của người viết code.

> Mục tiêu là tạo code: đúng, đơn giản, nhất quán, dễ đọc, dễ bảo trì và đủ tốt cho nhu cầu thực tế.
