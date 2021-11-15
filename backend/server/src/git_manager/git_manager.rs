use git2::{IndexAddOption, Oid, Repository, Signature};

use crate::errors::error_handler::ServerError;

pub struct GitManager {
	path_to_repository: Option<String>,
	repository: Option<Repository>,
	last_indexed_tree_oid: Option<Oid>,
	is_nothing_to_commit: bool,
}

impl GitManager {
	pub fn new() -> Self {
		GitManager {
			path_to_repository: None,
			repository: None,
			last_indexed_tree_oid: None,
			is_nothing_to_commit: true,
		}
	}

	pub fn init_repository(&mut self, path: &str, author: &Signature) -> Result<(), ServerError> {
		let repository = Repository::init("/home/cuzkov".to_string() + path)?;

		self.repository = Some(repository);

		let repository = match &self.repository {
			Some(repository) => repository,
			None => {
				return Err(ServerError {
					error_status_code: 500,
					error_message: "".to_string(),
				});
			}
		};

		let mut index = repository.index()?;

		let tree_oid = index.write_tree()?;
		let tree = repository.find_tree(tree_oid)?;

		repository.commit(Some("HEAD"), author, author, "initial commit", &tree, &[])?;

		Ok(())
	}

	pub fn open_repository(&mut self, path: &str) -> Result<(), ServerError> {
		let repository = Repository::open(path)?;

		self.repository = Some(repository);

		Ok(())
	}

	pub fn get_path(&self) -> String {
		match &self.path_to_repository {
			Some(path) => path.clone(),
			None => "".to_string(),
		}
	}

	pub fn git_add(&mut self) -> Result<(), ServerError> {
		let repository = match &self.repository {
			Some(repository) => repository,
			None => {
				return Err(ServerError {
					error_status_code: 500,
					error_message: "".to_string(),
				});
			}
		};

		let mut index = repository.index()?;
		index.add_all(["*"].iter(), IndexAddOption::DEFAULT, None)?;
		index.write()?;

		let last_indexed_tree_oid = index.write_tree()?;

		self.last_indexed_tree_oid = Some(last_indexed_tree_oid);

		let head = repository.head()?;

		let head_tree = head.peel_to_tree()?;

		if last_indexed_tree_oid.ne(&head_tree.id()) {
			self.is_nothing_to_commit = false;
		}

		Ok(())
	}

	pub fn git_commit(
		&mut self,
		author: &Signature,
		committer: &Signature,
		message: &str,
	) -> Result<(), ServerError> {
		if !self.is_nothing_to_commit {
			match &self.repository {
				Some(repository) => match &self.last_indexed_tree_oid {
					Some(tree_oid) => {
						let tree = repository.find_tree(*tree_oid)?;
						let head = repository.head()?;
						let last_commit = head.peel_to_commit()?;

						repository.commit(Some("HEAD"), author, committer, message, &tree, &[&last_commit])?;
					}
					None => {
						return Err(ServerError {
							error_status_code: 500,
							error_message: "".to_string(),
						});
					}
				},
				None => {
					return Err(ServerError {
						error_status_code: 500,
						error_message: "".to_string(),
					});
				}
			};
		}

		Ok(())
	}
}
