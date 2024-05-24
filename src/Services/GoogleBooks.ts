/** A wrapper for the Google Books API. */
import { singleton } from 'tsyringe';
import superagent from 'superagent';

@singleton()
export class GoogleBooks {
	/** The URL of the API. */
	private readonly apiURL: string = 'https://www.googleapis.com/books/v1/volumes';

	/** Retrieves a book using the provided query. */
	public async fetchBook(book: string): Promise<Book> {
		const res = await superagent.get(`${this.apiURL}?q=${book}`);
		const bookData = res.body.items?.[0]?.volumeInfo;

		const mappedAuthors = bookData?.authors?.join(', ');
		const mappedCategories = bookData?.categories?.join(', ');

		const publishedDate = new Date(bookData?.publishedDate);
		const publishedDateUnix = Math.floor(publishedDate?.getTime() / 1000);

		const bookInfo: Book = {
			title: bookData?.title,
			description: bookData?.description,
			authors: mappedAuthors,
			publisher: bookData?.publisher,
			pageCount: bookData?.pageCount,
			publishedDate: bookData?.publishedDate,
			publishedDateUnix,
			categories: mappedCategories,
			coverImage: {
				smallThumbnail: bookData?.imageLinks?.smallThumbnail,
				thumbnail: bookData?.imageLinks?.thumbnail,
			},
		};

		return bookInfo;
	}
}

type Book = {
	/** The title of the book. */
	title: string;
	/** The description of the book. */
	description: string;
	/** The authors of the book. */
	authors: string[];
	/** The publisher of the book. */
	publisher: string;
	/** The number of pages that the book has. */
	pageCount: string;
	/** The date when the book was published. */
	publishedDate: string;
	/** The date when the book was published but in Unix. */
	publishedDateUnix: number;
	/** The genres the anime is under. */
	categories: string[];
	/** The cover image of the book. */
	coverImage: {
		smallThumbnail: string;
		thumbnail: string;
	};
}